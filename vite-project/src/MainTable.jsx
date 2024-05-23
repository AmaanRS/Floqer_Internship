import React, { useMemo, useState } from "react";
import { useTable, useSortBy } from "react-table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import data from "./data.json";

const MainTable = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);

  const columns = useMemo(
    () => [
      {
        Header: "Year",
        accessor: "year",
      },
      {
        Header: "Number of Total Jobs",
        accessor: "totalJobs",
      },
      {
        Header: "Average Salary in USD",
        accessor: "averageSalary",
      },
    ],
    []
  );

  const jobTitleColumns = useMemo(
    () => [
      {
        Header: "Job Title",
        accessor: "jobTitle",
      },
      {
        Header: "Number of Jobs",
        accessor: "jobCount",
      },
    ],
    []
  );

  const processData = (data) => {
    const result = [];
    const yearJobsMap = {};

    data.forEach((item) => {
      if (!yearJobsMap[item.work_year]) {
        yearJobsMap[item.work_year] = {
          year: item.work_year,
          totalJobs: 0,
          totalSalary: 0,
        };
      }
      yearJobsMap[item.work_year].totalJobs += 1;
      yearJobsMap[item.work_year].totalSalary += item.salary_in_usd;
    });

    for (const year in yearJobsMap) {
      const { year: workYear, totalJobs, totalSalary } = yearJobsMap[year];
      result.push({
        year: workYear,
        totalJobs,
        averageSalary: totalSalary / totalJobs,
      });
    }

    return result;
  };

  const tableData = useMemo(() => processData(data), [data]);

  const handleRowClick = (year) => {
    const filteredData = data.filter((item) => item.work_year === year);
    const jobTitleCounts = filteredData.reduce((acc, item) => {
      if (!acc[item.job_title]) {
        acc[item.job_title] = 0;
      }
      acc[item.job_title] += 1;
      return acc;
    }, {});

    const jobTitlesData = Object.keys(jobTitleCounts).map((jobTitle) => ({
      jobTitle,
      jobCount: jobTitleCounts[jobTitle],
    }));

    setSelectedYear(year);
    setJobTitles(jobTitlesData);
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tableData,
      },
      useSortBy
    );

  return (
    <div>
      <h2>Main Table</h2>
      <table
        {...getTableProps()}
        style={{ width: "100%", borderCollapse: "collapse", margin: "20px 0" }}
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  style={{
                    cursor: "pointer",
                    background: "#f2f2f2",
                    padding: "8px",
                    border: "1px solid #ddd",
                  }}
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                onClick={() => handleRowClick(row.original.year)}
                style={{ cursor: "pointer" }}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    style={{ padding: "8px", border: "1px solid #ddd" }}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {selectedYear && <a>Check the selected year table below the line graph</a>}

      <h2>Number of Jobs Over the Years</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          width={600}
          height={300}
          data={tableData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalJobs"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {selectedYear && (
        <div>
          <h2>Job Titles in {selectedYear}</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              margin: "20px 0",
            }}
          >
            <thead>
              <tr>
                {jobTitleColumns.map((column) => (
                  <th
                    key={column.accessor}
                    style={{
                      cursor: "pointer",
                      background: "#f2f2f2",
                      padding: "8px",
                      border: "1px solid #ddd",
                    }}
                  >
                    {column.Header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobTitles.map((jobTitle, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {jobTitle.jobTitle}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                    {jobTitle.jobCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MainTable;
