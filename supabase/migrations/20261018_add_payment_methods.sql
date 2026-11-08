-- Migration: Add bank_transfer and card to payment_method enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'bank_transfer' 
    AND enumtypid = 'payment_method'::regtype
  ) THEN
    ALTER TYPE payment_method ADD VALUE 'bank_transfer';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'card' 
    AND enumtypid = 'payment_method'::regtype
  ) THEN
    ALTER TYPE payment_method ADD VALUE 'card';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If column is text or check constraint
    NULL;
END $$;
