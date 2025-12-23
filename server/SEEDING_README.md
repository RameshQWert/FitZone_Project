# Database Seeding Guide

## ⚠️ IMPORTANT: Data Safety

**NEVER run `node seed.js` directly** as it will DELETE ALL users including your registered members!

## ✅ Safe Seeding

Use `node safeSeed.js` instead - it preserves all existing users while refreshing other data.

### Commands:

```bash
# ✅ SAFE: Preserves users, refreshes classes/trainers/equipment
cd server
node safeSeed.js

# ❌ DANGEROUS: Deletes ALL users (including registered members)
node seed.js
```

### What Each Script Does:

#### `safeSeed.js` (RECOMMENDED)
- ✅ **Preserves all existing users**
- ✅ **Refreshes classes, trainers, equipment**
- ✅ **Creates default admin/member if missing**
- ✅ **Safe for production use**

#### `seed.js` (DANGER!)
- ❌ **Deletes ALL users**
- ✅ **Refreshes all data**
- ⚠️ **Only use for fresh database setup**

## 🔄 Backup & Restore

### Backup Users:
```bash
node backupUsers.js
```

### Restore Users:
```bash
node restoreUsers.js user-backup-2025-12-18T10-30-00.json
```

## 📊 Current Database Status

- **Users**: Preserved (your registered members)
- **Classes**: 12 fitness programs
- **Trainers**: 8 certified instructors
- **Equipment**: 22 gym items
- **Subscriptions**: 3 membership plans

## 🚀 For Future Development

Always use `safeSeed.js` when:
- Adding new classes
- Updating trainer information
- Modifying equipment data
- Refreshing sample data

This ensures your user registrations are never lost!