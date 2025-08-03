// Apper SDK Utility Functions
// This file provides a wrapper around the Apper SDK for payment processing

class ApperSDKManager {
  constructor() {
    this.isInitialized = false;
    this.sdkReady = false;
    this.config = {
      projectId: import.meta.env.VITE_APPER_PROJECT_ID,
      publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
      cdnUrl: import.meta.env.VITE_APPER_SDK_CDN_URL
    };
  }

  // Initialize the Apper SDK
  async initialize() {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if SDK is already loaded
      if (typeof window.Apper !== 'undefined') {
        this.sdkReady = true;
        this.isInitialized = true;
        resolve();
        return;
      }

      // Dynamically load the SDK
      const script = document.createElement('script');
      script.src = this.config.cdnUrl;
      script.async = true;
      
      script.onload = () => {
        if (typeof window.Apper !== 'undefined') {
          // Initialize with project configuration
          window.Apper.init({
            projectId: this.config.projectId,
            publicKey: this.config.publicKey,
            environment: 'production' // or 'sandbox' for testing
          });
          
          this.sdkReady = true;
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error('Apper SDK failed to load'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Apper SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Process payment through Apper SDK
  async processPayment(paymentConfig) {
    if (!this.sdkReady) {
      await this.initialize();
    }

    if (!window.Apper) {
      throw new Error('Apper SDK not available');
    }

try {
      const result = await window.Apper.processPayment({
        gateway: paymentConfig.gateway,
        amount: paymentConfig.amount,
        currency: paymentConfig.currency || 'PKR',
        orderId: paymentConfig.orderId,
        customer: paymentConfig.customerInfo,
        metadata: paymentConfig.metadata,
        returnUrl: window.location.origin + '/checkout?payment=success',
        cancelUrl: window.location.origin + '/checkout?payment=cancelled'
      });

      // Validate result structure
      if (!result) {
        throw new Error('No result received from payment processor');
      }

      const isSuccess = result.status === 'success' || result.status === 'completed';
      
      // Generate fallback transaction ID if missing but payment was successful
      let transactionId = result.transactionId;
      if (isSuccess && !transactionId) {
        transactionId = `APPER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.warn('Payment successful but no transaction ID provided, generated fallback:', transactionId);
      }

      return {
        success: isSuccess,
        status: result.status,
        transactionId: transactionId,
        receiptUrl: result.receiptUrl,
        error: result.error
      };
    } catch (error) {
      console.error('Apper payment processing error:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed',
        transactionId: null
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    if (!this.sdkReady) {
      await this.initialize();
    }

    if (!window.Apper) {
      throw new Error('Apper SDK not available');
    }

try {
      if (!transactionId) {
        throw new Error('Transaction ID is required for payment verification');
      }

      const result = await window.Apper.verifyPayment(transactionId);
      
      if (!result) {
        throw new Error('No verification result received');
      }

      return {
        success: result.status === 'completed' || result.status === 'success',
        status: result.status || 'unknown',
        transactionId: result.transactionId || transactionId,
        amount: result.amount,
        timestamp: result.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Apper payment verification error:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  // Confirm order with Apper
  async confirmOrder(orderData) {
    if (!this.sdkReady) {
      return; // Don't fail if SDK not available
    }

    try {
      await window.Apper.confirmOrder({
        orderId: orderData.orderId,
        transactionId: orderData.transactionId,
        amount: orderData.amount,
        status: orderData.status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Order confirmation failed:', error);
      // Don't throw error as this is not critical for order placement
    }
  }

  // Check if SDK is available and ready
  isReady() {
    return this.sdkReady && typeof window.Apper !== 'undefined';
  }

  // Get supported payment methods from Apper
  async getSupportedMethods() {
    if (!this.sdkReady) {
      await this.initialize();
    }

    if (!window.Apper) {
      return [];
    }

    try {
      return await window.Apper.getSupportedMethods();
    } catch (error) {
      console.warn('Failed to get supported payment methods:', error);
      return [];
    }
  }
}

// Create singleton instance
const apperSDK = new ApperSDKManager();

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  apperSDK.initialize().catch(error => {
    console.warn('Apper SDK auto-initialization failed:', error);
  });
}

export default apperSDK;

// Utility functions for easy access
export const processPayment = (config) => apperSDK.processPayment(config);
export const verifyPayment = (transactionId) => apperSDK.verifyPayment(transactionId);
export const confirmOrder = (orderData) => apperSDK.confirmOrder(orderData);
export const isApperReady = () => apperSDK.isReady();