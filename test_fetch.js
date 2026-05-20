const test = async () => {
    try {
        // Test login with seeded user
        const res = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'john@example.com', password: '123456' })
        });
        const data = await res.json();
        console.log("Login Status:", res.status);
        console.log("Login Response:", data);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
};
test();
