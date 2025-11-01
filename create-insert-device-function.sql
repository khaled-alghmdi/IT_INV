-- Create RPC function to insert device
CREATE OR REPLACE FUNCTION insert_device(
    p_asset_number TEXT,
    p_serial_number TEXT,
    p_device_type TEXT,
    p_brand TEXT DEFAULT NULL,
    p_model TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'available',
    p_notes TEXT DEFAULT NULL,
    p_purchase_date DATE DEFAULT NULL,
    p_assigned_to TEXT DEFAULT NULL,
    p_assigned_date DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.devices (
        asset_number,
        serial_number,
        device_type,
        brand,
        model,
        status,
        notes,
        purchase_date,
        assigned_to,
        assigned_date
    ) VALUES (
        p_asset_number,
        p_serial_number,
        p_device_type,
        p_brand,
        p_model,
        p_status,
        p_notes,
        p_purchase_date,
        p_assigned_to,
        p_assigned_date
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;

SELECT '✅ Function created! Try adding device now.' as status;

