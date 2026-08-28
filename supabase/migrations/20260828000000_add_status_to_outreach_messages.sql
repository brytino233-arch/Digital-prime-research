ALTER TABLE public.outreach_messages ADD COLUMN status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Ready', 'Sent', 'Replied', 'Meeting'));
