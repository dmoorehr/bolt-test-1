/*
  # Create dashboard_data table with headers support

  1. New Tables
    - `dashboard_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `data` (jsonb, stores spreadsheet data)
      - `headers` (text[], stores column headers)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to:
      - Insert their own data
      - Read their own data
*/

create table if not exists dashboard_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  data jsonb not null,
  headers text[] not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table dashboard_data enable row level security;

-- Create policy to allow users to insert their own data
create policy "Users can insert their own data"
on dashboard_data
for insert
to authenticated
with check (auth.uid() = user_id);

-- Create policy to allow users to read their own data
create policy "Users can read their own data"
on dashboard_data
for select
to authenticated
using (auth.uid() = user_id);