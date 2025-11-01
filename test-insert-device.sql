-- Test insert to see what's wrong
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
    'TEST001',
    'SN-TEST-001',
    'Laptop',
    'Dell',
    'Latitude',
    'available',
    'Test device',
    '2024-01-01',
    NULL,
    NULL
);

-- If this works, check what was inserted
SELECT * FROM public.devices WHERE asset_number = 'TEST001';

-- Clean up test
-- DELETE FROM public.devices WHERE asset_number = 'TEST001';

