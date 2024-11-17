// import Layout from "./Layout";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/hooks/useAuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
const BACKEND_URL = import.meta.env.VITE_APP_URL;

export function Dashboard() {
  const { user } = useAuthContext();
  const [cookies] = useCookies(["token"]);

  const [totalBookings, setTotalBookings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  // const [error, setError] = useState<string | null>(null); // Allow string or null
  const [token, setToken] = useState<string | null>(null);

  interface Booking {
    price: number; // Adjust based on your actual booking properties
    // Add other properties if needed
  }

  // Sync token from cookies when available
  useEffect(() => {
    const syncToken = () => {
      if (cookies.token) {
        console.log("Cookie token found:", !!cookies.token); // Safe logging
        setToken(cookies.token);
      } else {
        // Try getting token from the response if cookie method failed
        const tokenFromStorage = localStorage.getItem("token");
        if (tokenFromStorage) {
          setToken(tokenFromStorage);
          console.log("Retrieved token from storage");
        } else {
          console.log("No token available");
          setToken(null);
        }
      }
    };

    syncToken();
  }, [cookies.token]);
  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get<Booking[]>(
          `${BACKEND_URL}/user/bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
            withCredentials: true,
          }
        );

        //  Calculate total bookings and total earnings directly here
        const total = data.length; // Total number of bookings
        const earnings = data.reduce(
          (total, booking) => total + booking.price,
          0
        ); // Sum of all booking prices

        // Update state with calculated values
        setTotalBookings(total);
        setTotalEarnings(earnings);
      } catch {
        // setError((err as Error).message || "An error occurred while fetching bookings");
      }
    };

    fetchBookings();
  }, [token]);

  if (!user) {
    return <h1>Please log in to access the dashboard</h1>;
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Welcome, <span>{user.name}</span>
        </h1>
      </div>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
          {/* {error && <p className="error">{error}</p>} */}
          <div className="grid gap-4 sm:grid-cols-2 ">
            <Card x-chunk="dashboard-05-chunk-1">
              <CardHeader className="pb-2">
                <CardDescription>Total earnings </CardDescription>
                <CardTitle className="text-4xl">
                  ₦{totalEarnings.toFixed(2)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  +0% from last week
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={5} aria-label="25% increase" />
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2" className="">
              <CardHeader className="pb-2">
                <CardDescription>Total bookings</CardDescription>
                <CardTitle className="text-4xl">{totalBookings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground">
                  +0% from last month
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={5} aria-label="12% increase" />
              </CardFooter>
            </Card>
          </div>
        </div>
        <div></div>
      </main>
      {/* <Layout>
      
      </Layout> */}
    </>
  );
}
