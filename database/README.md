# Database setup

The app supports PostgreSQL and MariaDB. Select the driver with `DB_DRIVER`.

## Local PostgreSQL

1. Set `DB_DRIVER=postgres` in `.env.local` and configure the PostgreSQL settings from `.env.example`.
2. Set
   `PGPASSWORD` to the password for the `cv_builder` role. Keep `.env.local`
   private and do not commit it.
3. From the project root, apply the PostgreSQL schema. The command prompts for the role's
   password:

   ```sh
   psql -h 127.0.0.1 -U cv_builder -d arabic_cv_builder -f database/schema.sql
   ```

4. Start the app with `npm run dev`.

## Hostinger MariaDB

1. Create a MariaDB database and user in hPanel.
2. Configure `MYSQL_HOST=127.0.0.1`, `MYSQL_PORT=3306`, `MYSQL_DATABASE`,
   `MYSQL_USER`, and `MYSQL_PASSWORD` in the Node.js Web App environment
   settings, and set `DB_DRIVER=mysql`. The Hostinger-style `DB_HOST`,
   `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` aliases are also accepted;
   if `DB_DRIVER` is omitted, the app selects MySQL when `DB_NAME` is present.
   For an app running on Hostinger, use `127.0.0.1` as the
   database host. The `srv...hstgr.io` hostname is for remote connections from
   outside Hostinger, such as migrating data from your computer.
3. Import `schema.mariadb.sql` into that database through phpMyAdmin.
4. To copy accounts and CV records from local PostgreSQL, configure Hostinger's
   remote MySQL access and run `npm run db:migrate:mariadb`. The script refuses
   to run when the MariaDB tables already contain rows and never changes the
   PostgreSQL source. It does not copy sessions or uploaded image files.

The app stores account records, sessions, and CVs in the selected database.
Uploaded photos are stored under `storage/uploads/` by default; on Hostinger,
set `CV_UPLOAD_DIR` to a writable
directory outside the deployment build folders so uploads survive redeployment.
