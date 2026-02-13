import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://ubeoxhrdqcreaqnwlyzd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZW94aHJkcWNyZWFxbndseXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NDg1NjMsImV4cCI6MjA4NjIyNDU2M30.wbbkLOg4FeFEuzGcsuq2N6GPXnKvlXRT6X4H4eol8PY"
);
