-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

SELECT '✅ Real-time enabled for notifications!' as status;

