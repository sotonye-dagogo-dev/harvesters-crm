import { message } from "antd";

/**
 * Toast notification helpers using Ant Design message component
 * These provide consistent, user-friendly feedback messages throughout the app
 */

export const toast = {
  /**
   * Show success message
   * @example toast.success('Meeting created successfully')
   */
  success: (content: string, duration: number = 3) => {
    message.success({
      content,
      duration,
      style: { marginTop: "20vh" },
    });
  },

  /**
   * Show error message
   * @example toast.error('Failed to save changes')
   */
  error: (content: string, duration: number = 4) => {
    message.error({
      content,
      duration,
      style: { marginTop: "20vh" },
    });
  },

  /**
   * Show warning message
   * @example toast.warning('Please fill in all required fields')
   */
  warning: (content: string, duration: number = 3) => {
    message.warning({
      content,
      duration,
      style: { marginTop: "20vh" },
    });
  },

  /**
   * Show info message
   * @example toast.info('New feature available')
   */
  info: (content: string, duration: number = 3) => {
    message.info({
      content,
      duration,
      style: { marginTop: "20vh" },
    });
  },

  /**
   * Show loading message with promise
   * @example
   * await toast.promise(
   *   saveData(),
   *   'Saving...',
   *   'Saved successfully!',
   *   'Failed to save'
   * )
   */
  promise: async <T>(
    promise: Promise<T>,
    loading: string,
    success: string,
    error: string
  ): Promise<T> => {
    const hide = message.loading(loading, 0);

    try {
      const result = await promise;
      hide();
      toast.success(success);
      return result;
    } catch (err) {
      hide();
      toast.error(error);
      throw err;
    }
  },
};

/**
 * Operation-specific toast messages
 */
export const operationToasts = {
  // Create operations
  created: (itemName: string) =>
    toast.success(`${itemName} created successfully`),
  createFailed: (itemName: string) =>
    toast.error(`Failed to create ${itemName}`),

  // Update operations
  updated: (itemName: string) =>
    toast.success(`${itemName} updated successfully`),
  updateFailed: (itemName: string) =>
    toast.error(`Failed to update ${itemName}`),

  // Delete operations
  deleted: (itemName: string) =>
    toast.success(`${itemName} deleted successfully`),
  deleteFailed: (itemName: string) =>
    toast.error(`Failed to delete ${itemName}`),

  // Save operations
  saved: () => toast.success("Changes saved successfully"),
  saveFailed: () => toast.error("Failed to save changes"),

  // Load operations
  loadFailed: (itemName: string) => toast.error(`Failed to load ${itemName}`),

  // Copy operations
  copied: () => toast.success("Copied to clipboard"),
  copyFailed: () => toast.error("Failed to copy to clipboard"),

  // Upload operations
  uploaded: () => toast.success("File uploaded successfully"),
  uploadFailed: () => toast.error("Failed to upload file"),

  // Generic operations
  success: (action: string) => toast.success(`${action} successful`),
  failed: (action: string) => toast.error(`${action} failed`),
};

/**
 * Validation toast messages
 */
export const validationToasts = {
  required: (fieldName: string) => toast.warning(`${fieldName} is required`),
  invalid: (fieldName: string) =>
    toast.warning(`Please enter a valid ${fieldName}`),
  tooShort: (fieldName: string, minLength: number) =>
    toast.warning(`${fieldName} must be at least ${minLength} characters`),
  tooLong: (fieldName: string, maxLength: number) =>
    toast.warning(`${fieldName} must not exceed ${maxLength} characters`),
  mismatch: (field1: string, field2: string) =>
    toast.warning(`${field1} and ${field2} do not match`),
};
