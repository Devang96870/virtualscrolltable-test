import React, { useEffect, useState, useRef, useCallback } from "react";
import { FixedSizeList as List } from "react-window"; // for virtual scrolling performance
import "./App.css";

const App = () => {
  // Store user data from the API
  const [userdata, setUserdata] = useState([]);

  // Keep track of current page number for fetching
  const [page, setPage] = useState(1);

  // Flag to stop fetching if there’s no more data
  const [hasMore, setHasMore] = useState(true);

  // To avoid multiple fetch calls at the same time
  const isFetchingRef = useRef(false);

  // Fetch 20 users from the API
  const fetchUsers = async () => {
    // Stop if already fetching
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Call API with current page
    const url = `https://randomuser.me/api/?page=${page}&results=20&seed=abc`;
    const response = await fetch(url);
    const data = await response.json();

    // If new users are returned, add them to list
    if (data?.results?.length > 0) {
      setUserdata((prev) => [...prev, ...data.results]);
      setPage((prev) => prev + 1);
    } else {
      // Stop fetching if no more data
      setHasMore(false);
    }

    isFetchingRef.current = false;
  };

  // Fetch users when component first loads
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to classify users by age
  const getClassification = (age) => {
    if (age <= 30) return "A";
    if (age <= 60) return "B";
    return "C";
  };

  // Render a single row (user) in the virtual scroll list
  const Row = ({ index, style }) => {
    const user = userdata[index];
    if (!user) return null;

    return (
      <div className="table-row" style={style}>
        <div className="cell id">{user.id?.value || "N/A"}</div>
        <div className="cell name">{user.name?.first}</div>
        <div className="cell state">{user.location?.state}</div>
        <div className="cell country">{user.location?.country}</div>
        <div className="cell email">{user.email}</div>
        <div className="cell phone">{user.phone}</div>
        <div className="cell class">{getClassification(user.dob?.age)}</div>
      </div>
    );
  };

  // Load more users when user scrolls to the end of list
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }) => {
      if (visibleStopIndex >= userdata.length - 1 && hasMore) {
        fetchUsers();
      }
    },
    [userdata, hasMore]
  );

  return (
    // Center everything on screen
    <div className="page-center">
      <div className="container">
        <h2>User Table (Virtual Scroll)</h2>

        {/* Table wrapper with scrollable list */}
        <div className="table-wrapper">
          {/* Table header */}
          <div className="table-header">
            <div className="cell id">ID</div>
            <div className="cell name">Name</div>
            <div className="cell state">State</div>
            <div className="cell country">Country</div>
            <div className="cell email">Email</div>
            <div className="cell phone">Phone</div>
            <div className="cell class">Class</div>
          </div>

          {/* Scrollable table rows using react-window */}
          <List
            height={400} // height of the scrollable area
            itemCount={userdata.length} // total rows
            itemSize={50} // height of each row
            width={"100%"} // full width
            onItemsRendered={handleItemsRendered} // trigger more data when needed
          >
            {Row}
          </List>
        </div>
      </div>
    </div>
  );
};

export default App;
