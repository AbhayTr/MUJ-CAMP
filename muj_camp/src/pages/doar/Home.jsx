/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ensureAdminAccess } from "../../tools/Auth";
import DataTable from "../../custom_components/Table";
import LoadSpinner from "../../custom_components/LoadSpinner";
import { AuthStore } from "../../app_state/auth/auth";

const Home = () => {

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        ensureAdminAccess("DOAR", setLoading, navigate);
    }, []);

    function generateFakeData(numRows, numCols) {
        const fakeData = [];
      
        // Data pools for random selection
        const firstNames = ["John", "Jane", "Emily", "Michael", "Sarah", "David"];
        const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Miller", "Davis"];
        const cities = ["New York", "Los Angeles", "Chicago", "Miami", "Houston", "Austin"];
        const jobTitles = ["Developer", "Accountant", "Designer", "Manager", "Salesperson"];
      
        // Function for random selection from an array
        const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
      
        // Generate the data
        for (let i = 0; i < numRows; i++) {
          const row = [];
          for (let j = 0; j < numCols; j++) {
            // Generate different types of data with some repetition
            switch (j) {
              case 0: // Full Name
                row.push(`${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`);
                break;
              case 1: // City
                row.push(getRandomItem(cities));
                break;
              case 2: // Job Title
                row.push(getRandomItem(jobTitles));
                break;
              case 3: // Age (between 20 and 60) 
                row.push(Math.floor(Math.random() * 41) + 20);
                break;
              case 4: // Salary (between 40000 and 150000)
                row.push(Math.floor(Math.random() * 110001) + 40000);
                break;
              default:
                break;
            }
          }
          fakeData.push(row);
        }
      
        return fakeData;
      }

    return (
        (loading) ? (
            <LoadSpinner />
        ) : (
            <>
                <DataTable
                    title="Alumni List"
                    // setFiltersAutomatically={false}
                    updatePageData={(tableCurrentPage, setTableLoading, setTableHeaders, setTableData, setTablePages, setFilters, filters) => {
                        setTableHeaders(["Name", "Country", "City", "Area", "Village"]);
                        setTablePages(3);
                        setTableData(generateFakeData(100, 5));
                        setTableLoading(false);
                    }}
                >
                    <div
                        style={{
                            padding: "1rem"
                        }}
                        id="doarHeading"
                    >
                        <h4 style={{
                            marginBottom: "0.7rem",
                            fontWeight: "bold"
                        }}>
                            Hello {AuthStore.getState().authName} 👋
                        </h4>
                        <p style={{
                            textAlign: "justify"
                        }}>
                            Welcome to the <b>Alumni Data Management Portal</b>. Alumni Data is listed below, and can be managed from there.
                        </p>
                    </div>
                </DataTable>
            </>
        )
    )   
}

export { Home };