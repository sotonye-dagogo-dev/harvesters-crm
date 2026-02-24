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
    } catch (err: unknown) {
      hide();
      // Provide detailed error message if available
      let errorMessage = error;
      if (err instanceof Error && err.message) {
        errorMessage = `${error}: ${err.message}`;
      } else if (typeof err === "string") {
        errorMessage = `${error}: ${err}`;
      }
      toast.error(errorMessage);
      throw err;
    }
  },
};

/**
 * Operation-specific toast messages
 */
export const operationToasts = {
  // Create operations
  created: (itemName: string, reason?: string) =>
    toast.success(
      `${itemName} created successfully${reason ? `: ${reason}` : ""}`
    ),
  createFailed: (itemName: string, reason?: string) =>
    toast.error(
      `Failed to create ${itemName}${reason ? `: ${reason}` : ""}`,
      5
    ),

  // Update operations
  updated: (itemName: string, reason?: string) =>
    toast.success(
      `${itemName} updated successfully${reason ? `: ${reason}` : ""}`
    ),
  updateFailed: (itemName: string, reason?: string) =>
    toast.error(
      `Failed to update ${itemName}${reason ? `: ${reason}` : ""}`,
      5
    ),

  // Delete operations
  deleted: (itemName: string, reason?: string) =>
    toast.success(
      `${itemName} deleted successfully${reason ? `: ${reason}` : ""}`
    ),
  deleteFailed: (itemName: string, reason?: string) =>
    toast.error(
      `Failed to delete ${itemName}${reason ? `: ${reason}` : ""}`,
      5
    ),

  // Save operations
  saved: () => toast.success("Changes saved successfully"),
  saveFailed: (reason?: string) =>
    toast.error(`Failed to save changes${reason ? `: ${reason}` : ""}`, 5),

  // Load operations
  loadFailed: (itemName: string, reason?: string) =>
    toast.error(`Failed to load ${itemName}${reason ? `: ${reason}` : ""}`, 5),

  // Copy operations
  copied: () => toast.success("Copied to clipboard"),
  copyFailed: () =>
    toast.error(
      "Failed to copy to clipboard. Please try manually selecting and copying."
    ),

  // Upload operations
  uploaded: () => toast.success("File uploaded successfully"),
  uploadFailed: (reason?: string) =>
    toast.error(
      `Failed to upload file${reason ? `: ${reason}` : ". Please check file size and format."}`,
      5
    ),

  // Generic operations
  success: (action: string) => toast.success(`${action} successful`),
  failed: (action: string, reason?: string) =>
    toast.error(`${action} failed${reason ? `: ${reason}` : ""}`, 5),
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
