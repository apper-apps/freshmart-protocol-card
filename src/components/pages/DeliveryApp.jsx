import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { deliveryService } from '@/services/api/deliveryService';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { cn } from '@/utils/cn';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const StatusUpdateModal = ({ order, isOpen, onClose, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || '');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'packed', label: 'Packed', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' }
  ];

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(order.Id, selectedStatus, notes);
      toast.success(`Order #${order.Id} status updated to ${selectedStatus}`);
      onClose();
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Update Order Status</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <ApperIcon name="X" size={20} />
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Order #{order.Id}</p>
            <p className="font-medium">{order.deliveryAddress.fullName}</p>
            <p className="text-sm text-gray-600">{order.deliveryAddress.address}</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Status</label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-2"
                  />
                  <Badge className={option.color}>{option.label}</Badge>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add delivery notes..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={!selectedStatus || isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const MapComponent = ({ orders, currentLocation, selectedOrder, onOrderSelect }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedOrder && selectedOrder.location) {
      map.setView([selectedOrder.location.lat, selectedOrder.location.lng], 15);
    }
  }, [selectedOrder, map]);

  const getMarkerIcon = (status) => {
    switch (status) {
      case 'packed': return createCustomIcon('blue');
      case 'shipped': return createCustomIcon('orange');
      case 'delivered': return createCustomIcon('green');
      default: return createCustomIcon('grey');
    }
  };

  return (
    <>
      {currentLocation && (
        <Marker 
          position={[currentLocation.lat, currentLocation.lng]}
          icon={createCustomIcon('red')}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-semibold">Your Location</h4>
              <p className="text-sm">Delivery Personnel</p>
            </div>
          </Popup>
        </Marker>
      )}
      
      {orders.map((order) => order.location && (
        <Marker
          key={order.Id}
          position={[order.location.lat, order.location.lng]}
          icon={getMarkerIcon(order.status)}
          eventHandlers={{
            click: () => onOrderSelect(order)
          }}
        >
          <Popup>
            <div className="p-2">
              <h4 className="font-semibold">Order #{order.Id}</h4>
              <p className="text-sm">{order.deliveryAddress.fullName}</p>
              <p className="text-xs text-gray-600 mb-2">{order.deliveryAddress.address}</p>
              <Badge className={
                order.status === 'packed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }>
                {order.status}
              </Badge>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const DeliveryApp = () => {
  const [orders, setOrders] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, location] = await Promise.all([
        deliveryService.getDeliveryOrders(),
        deliveryService.getCurrentLocation()
      ]);
      setOrders(ordersData);
      setCurrentLocation(location);
    } catch (err) {
      setError('Failed to load delivery data');
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status, notes) => {
    try {
      const updatedOrder = await deliveryService.updateOrderStatus(orderId, status, notes);
      setOrders(orders.map(order => 
        order.Id === orderId ? updatedOrder : order
      ));
      setSelectedOrder(null);
      setShowStatusModal(false);
    } catch (error) {
      throw error;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="flex flex-col h-screen bg-surface-200">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Delivery App</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              className="p-2 rounded-lg bg-primary-50 text-primary-700"
            >
              <ApperIcon name={viewMode === 'map' ? 'List' : 'Map'} size={20} />
            </button>
            <button
              onClick={loadData}
              className="p-2 rounded-lg bg-surface-100 text-gray-600"
            >
              <ApperIcon name="RefreshCw" size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Packed ({orders.filter(o => o.status === 'packed').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Shipped ({orders.filter(o => o.status === 'shipped').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Delivered ({orders.filter(o => o.status === 'delivered').length})</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === 'map' ? (
          <div className="h-full">
            <MapContainer
              center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [31.5497, 74.3436]}
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapComponent
                orders={orders}
                currentLocation={currentLocation}
                selectedOrder={selectedOrder}
                onOrderSelect={setSelectedOrder}
              />
            </MapContainer>
            
            {/* Floating Order Info */}
            {selectedOrder && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <Card className="bg-white p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Order #{selectedOrder.Id}</h3>
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryAddress.fullName}</p>
                    </div>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{selectedOrder.deliveryAddress.address}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(null)}
                      className="flex-1"
                    >
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowStatusModal(true)}
                      className="flex-1"
                    >
                      Update Status
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="h-full overflow-y-auto p-4">
            <div className="space-y-3">
              {orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <ApperIcon name="Package" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Available</h3>
                  <p className="text-gray-500">No orders are ready for delivery at the moment.</p>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.Id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">Order #{order.Id}</h3>
                        <p className="text-sm text-gray-600">{order.deliveryAddress.fullName}</p>
                        <p className="text-sm text-gray-500">{order.deliveryAddress.phone}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        <ApperIcon name="MapPin" size={14} className="inline mr-1" />
                        {order.deliveryAddress.address}
                      </p>
                      {order.deliveryAddress.landmarks && (
                        <p className="text-xs text-gray-500">
                          Landmark: {order.deliveryAddress.landmarks}
                        </p>
                      )}
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium">Items: {order.items.length}</p>
                      <p className="text-sm text-gray-600">Total: PKR {order.total}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setViewMode('map');
                        }}
                        className="flex-1"
                      >
                        <ApperIcon name="Map" size={16} className="mr-1" />
                        View on Map
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowStatusModal(true);
                        }}
                        className="flex-1"
                      >
                        Update Status
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        order={selectedOrder}
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
        }}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default DeliveryApp;