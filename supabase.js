const SUPABASE_URL = "https://ivyuzrbdjpncvjsnjybm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eXV6cmJkanBuY3Zqc25qeWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NzgwNjEsImV4cCI6MjA5NTU1NDA2MX0._70MBLXRgi69eeEezdQ3pD-BSQmCT_6zGA4hvIXJR8A";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
