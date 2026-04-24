-- HARD SAFETY: prevent deletion if user is still in grace window

CREATE OR REPLACE FUNCTION public.prevent_early_deletion()
RETURNS trigger AS $$
BEGIN
  IF OLD.data_delete_at IS NOT NULL AND OLD.data_delete_at > now() THEN
    RAISE EXCEPTION 'Deletion blocked: user still in grace window';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_early_delete ON public.user_billing;

CREATE TRIGGER trg_prevent_early_delete
BEFORE DELETE ON public.user_billing
FOR EACH ROW
EXECUTE FUNCTION public.prevent_early_deletion();
