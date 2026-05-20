import axios from 'axios';

axios.post('http://localhost:5000/api/users', {
    name: "test user",
    email: "test@example.com",
    password: "password123"
}).then(res => {
    console.log("Success:", res.data);
}).catch(err => {
    console.log("Error Status:", err.response?.status);
    console.log("Error Message:", err.response?.data?.message);
    console.log("Error Stack:", err.response?.data?.stack);
});
