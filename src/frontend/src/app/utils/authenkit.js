//authenkit for easy to implement fetching data from auth service
import liff from "@line/liff";

const authenticate = async (payload) => {
    try {

        const auth = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!auth.ok) {
            // idToken หมดอายุ → force logout แล้ว login ใหม่เพื่อให้ LINE ออก idToken ใหม่
            liff.logout();
            liff.login();
            return;
        }

        const { token } = await auth.json();
        localStorage.setItem("TU_Smart_Service JWT Token", token);

    } catch (err) {
        console.log("Authenticated failed", err)
    }
}


const verify = async () => {
    try {

        const token = localStorage.getItem("TU_Smart_Service JWT Token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, {
            method: "GET",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        return await res.json();

    } catch {

    }
}

export {authenticate , verify}