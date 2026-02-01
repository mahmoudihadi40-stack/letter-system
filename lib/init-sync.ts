let initialized = false;

export async function ensureDbInitialized() {
  if (initialized) return;

  try {
    // تلاش برای آغاز دیتابیس
    const response = await fetch(`http://localhost:${process.env.PORT || 3000}/api/init`, {
      method: 'POST',
    }).catch(() => null);

    if (response?.ok) {
      initialized = true;
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}
