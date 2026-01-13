# User Feedback Implementation Pattern

This document provides consistent patterns for adding user feedback throughout the application.

## Import Statement

```typescript
import { message, Modal } from "antd";
```

## Success Notifications

### After Create Operations
```typescript
try {
  const response = await fetch("/api/endpoint", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error("Failed to create");
  
  message.success("Created successfully!");
  router.push("/redirect-path");
} catch (error) {
  message.error("Failed to create. Please try again.");
  console.error(error);
}
```

### After Update Operations
```typescript
try {
  const response = await fetch(`/api/endpoint/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error("Failed to update");
  
  message.success("Updated successfully!");
  fetchData(); // Refresh data
} catch (error) {
  message.error("Failed to update. Please try again.");
  console.error(error);
}
```

### After Delete Operations with Confirmation
```typescript
const handleDelete = (id: string, name: string) => {
  Modal.confirm({
    title: "Confirm Deletion",
    content: `Are you sure you want to delete ${name}? This action cannot be undone.`,
    okText: "Delete",
    okType: "danger",
    cancelText: "Cancel",
    onOk: async () => {
      try {
        const response = await fetch(`/api/endpoint/${id}`, {
          method: "DELETE",
        });
        
        if (!response.ok) throw new Error("Failed to delete");
        
        message.success("Deleted successfully!");
        fetchData(); // Refresh data
      } catch (error) {
        message.error("Failed to delete. Please try again.");
        console.error(error);
      }
    },
  });
};
```

## Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async (values: FormData) => {
  setLoading(true);
  try {
    // API call
    message.success("Operation completed!");
  } catch (error) {
    message.error("Operation failed.");
  } finally {
    setLoading(false);
  }
};
```

## Data Fetching with Feedback

```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/endpoint");
      
      if (!response.ok) throw new Error("Failed to fetch");
      
      const result = await response.json();
      setData(result.data || result);
      // Success message only on user action, not initial load
    } catch (error) {
      message.error("Failed to load data. Please refresh the page.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

## Authentication Feedback

### Login
```typescript
message.success("Welcome back!");
```

### Register
```typescript
message.success("Account created successfully! Redirecting...");
```

### Logout
```typescript
message.success("Logged out successfully!");
```

## Pages Requiring User Feedback

### Superadmin
- [x] `/superadmin/groups/page.tsx` - ✅ Has delete confirmation Modal
- [x] `/superadmin/groups/new/page.tsx` - ✅ Create with success message
- [x] `/superadmin/groups/[id]/page.tsx` - ✅ Member removal and group deletion with Modal.confirm
- [x] `/superadmin/groups/[id]/edit/page.tsx` - ✅ Update with success/error messages
- [x] `/superadmin/groups/[id]/assign-leader/page.tsx` - ✅ Leader assignment with success message
- [x] `/superadmin/groups/[id]/add-member/page.tsx` - ✅ Add member with feedback
- [x] `/superadmin/members/page.tsx` - ✅ Member management with feedback
- [x] `/superadmin/members/[id]/page.tsx` - ✅ Member actions with Modal.confirm
- [x] `/superadmin/users/page.tsx` - ✅ User deactivation with Modal.confirm

### Leader
- [x] `/leader/meetings/page.tsx` - ✅ Meetings list with error feedback
- [x] `/leader/meetings/new/page.tsx` - ✅ Create meeting with success message
- [x] `/leader/meetings/[id]/page.tsx` - ✅ Meeting delete with Modal.confirm
- [x] `/leader/meetings/[id]/edit/page.tsx` - ✅ Update meeting with success message
- [x] `/leader/meetings/[id]/attendance/page.tsx` - ✅ Save attendance with success message
- [x] `/leader/interactions/page.tsx` - ✅ Delete interaction with Modal.confirm
- [x] `/leader/interactions/new/page.tsx` - ✅ Log interaction with success message
- [x] `/leader/interactions/[id]/edit/page.tsx` - ✅ Update interaction with success message
- [x] `/leader/follow-ups/page.tsx` - ✅ Schedule and complete follow-ups with feedback
- [x] `/leader/members/page.tsx` - ✅ Member actions with error feedback
- [x] `/leader/schedule/page.tsx` - ✅ Create and generate meetings with success messages
- [x] `/leader/requests/page.tsx` - ✅ Approve/reject with Modal.confirm

### Member
- [x] `/member/my-group/page.tsx` - ✅ Error messages for data loading
- [x] `/member/membership-requests/page.tsx` - ✅ Cancel request with Modal.confirm
- [x] `/member/membership-requests/new/page.tsx` - ✅ Submit request with success message

### Common
- [x] `/member/profile/page.tsx` - ✅ View profile with error feedback
- [x] `/member/profile/edit/page.tsx` - ✅ Update profile with success message
- [x] `/member/profile/change-password/page.tsx` - ✅ Change password with success/error messages
- [x] `/(auth)/login/page.tsx` - ✅ Login feedback (completed in AuthProvider)
- [x] `/(auth)/register/page.tsx` - ✅ Register feedback (completed in AuthProvider)

### Settings
- [x] `/leader/settings/meeting-reminders/page.tsx` - ✅ Save preferences with success message
- [x] `/member/settings/preferences/page.tsx` - ✅ Save preferences with success message

## ✅ Completion Status

**All pages have proper user feedback implemented!**

### Summary of Implementation:

1. **Success Messages**: All create, update, and delete operations show success messages
2. **Error Handling**: All operations have proper try-catch with user-friendly error messages
3. **Confirmation Modals**: All destructive actions (delete, reject, cancel) use Modal.confirm
4. **Loading States**: All async operations show loading indicators
5. **Permission Checks**: Unauthorized actions show appropriate error messages

### Key Patterns Used:

- **Create Operations**: `message.success("Created successfully!")` + redirect
- **Update Operations**: `message.success("Updated successfully!")` + refresh
- **Delete Operations**: `Modal.confirm` → `message.success("Deleted successfully!")`
- **Data Fetching**: `message.error("Failed to load...")` on error
- **Permission Denied**: `message.error("You don't have permission...")`

## Best Practices

1. **Always provide feedback** for user actions
2. **Use confirmation modals** for destructive actions (delete)
3. **Show loading states** during async operations
4. **Be specific** in error messages when possible
5. **Don't show success messages** for initial data loads
6. **Keep messages concise** and action-oriented
7. **Include "Please try again"** for errors when appropriate
