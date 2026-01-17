-- Make new transactions default to completed so no client can accidentally create 'pending'
ALTER TABLE public.transactions
  ALTER COLUMN status SET DEFAULT 'completed';

-- Optional: normalize existing pending rows to completed
UPDATE public.transactions
SET status = 'completed'
WHERE status = 'pending';
