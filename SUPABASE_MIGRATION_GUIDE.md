# POS CafeLux - Supabase Migration Guide

This guide will help you migrate your POS CafeLux application from the Replit Neon database to Supabase.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your POS CafeLux application files
3. Access to your Supabase project dashboard

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `pos-cafelux`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://[your-project-ref].supabase.co`
   - **Project Reference**: The part after `https://` and before `.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
   - **service_role key**: Long string starting with `eyJ...`

3. Go to **Settings** → **Database**
4. Copy the **Connection string** → **URI**
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

## Step 3: Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire content from `supabase-migration.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the migration
6. You should see: "POS CafeLux database migration completed successfully!"

## Step 4: Configure Your Application

1. Copy `.env.supabase` to `.env`:
   ```bash
   copy .env.supabase .env
   ```

2. Edit `.env` file and replace the placeholders:
   ```env
   # Replace [YOUR-SUPABASE-PASSWORD] with your database password
   # Replace [YOUR-PROJECT-REF] with your project reference
   DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
   
   # Replace with your actual Supabase values
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=change-this-to-a-random-secret-key
   ```

## Step 5: Test the Connection

1. Stop your current development server (Ctrl+C)
2. Start the server again:
   ```bash
   npm run dev
   ```
3. You should see:
   ```
   Starting database seeding...
   Database already seeded, skipping...
   serving on port 5000
   ```

4. Open http://localhost:5000 in your browser
5. Verify that:
   - Dashboard loads with data
   - Products page shows the migrated products
   - You can create new transactions

## Step 6: Verify Data Migration

Check that all data was migrated correctly:

### Users Table
- Should have 1 admin user
- Username: `admin`, Password: `admin123`

### Products Table
- Should have 8 products:
  - Roti Tawar Sari Roti (RTW001)
  - Susu Ultra 1L (SUL001)
  - Indomie Goreng (IMG001)
  - Teh Botol Sosro (TBS001)
  - Sabun Mandi Lifebuoy (SML001)
  - Beras Premium 5kg (BRP001)
  - Minyak Goreng Tropical 2L (MGT001)
  - Gula Pasir 1kg (GPS001)

### Categories Table
- Should have 7 categories:
  - Makanan, Minuman, Snack, Sembako, Personal Care, Kesehatan, Rumah Tangga

### Customers Table
- Should have 5 sample customers

## Step 7: Configure Supabase Security (Optional)

For production use, you may want to configure Row Level Security (RLS) policies:

1. Go to **Authentication** → **Policies** in Supabase dashboard
2. Review the automatically created policies
3. Modify them based on your security requirements

## Troubleshooting

### Connection Issues
- Verify your DATABASE_URL is correct
- Check that your database password doesn't contain special characters that need URL encoding
- Ensure your IP is allowed (Supabase allows all IPs by default)

### Migration Errors
- If you get "table already exists" errors, the tables were created successfully
- If you get permission errors, make sure you're using the correct credentials

### Application Errors
- Check the console for detailed error messages
- Verify all environment variables are set correctly
- Make sure the database connection is working

## Success Indicators

✅ **Migration Successful** when you see:
- No database connection errors in console
- Dashboard shows correct data
- Products page displays all 8 products
- You can create new transactions
- Data persists after server restart

## Next Steps

After successful migration:
1. Update your production environment variables
2. Set up proper authentication (if needed)
3. Configure backup strategies
4. Set up monitoring and alerts
5. Consider implementing proper user authentication

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review the application console for errors
3. Verify all environment variables are correct
4. Ensure the migration script ran completely

Your POS CafeLux application is now connected to Supabase! 🎉
