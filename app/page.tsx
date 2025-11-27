"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import { LocationSelector } from "@/components/location-selector";
import { DataTable } from "@/components/data-table";
import { DataVisualizations } from "@/components/data-visualizations";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2, Database, Download } from "lucide-react";
import {
  getAvailableLocations,
  loadCSVFile,
  searchRecords,
  filterRecords,
  getUniqueValues,
  type LocationFile,
  type CSVRecord,
} from "@/lib/csv-utils";

export default function DashboardPage() {
  const [locations, setLocations] = React.useState<LocationFile[]>([]);
  const [selectedLocation, setSelectedLocation] = React.useState("");
  const [allData, setAllData] = React.useState<CSVRecord[]>([]);
  const [filteredData, setFilteredData] = React.useState<CSVRecord[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [locationFilter, setLocationFilter] = React.useState("");
  const [buildingFilter, setBuildingFilter] = React.useState("");
  const [uniqueLocations, setUniqueLocations] = React.useState<string[]>([]);
  const [uniqueBuildings, setUniqueBuildings] = React.useState<string[]>([]);

  // Load available locations on mount
  React.useEffect(() => {
    getAvailableLocations().then(setLocations);
  }, []);

  // Load CSV data when location is selected
  React.useEffect(() => {
    if (!selectedLocation) {
      setAllData([]);
      setFilteredData([]);
      setHeaders([]);
      return;
    }

    const selectedFile = locations.find(
      (loc) => loc.value === selectedLocation
    );
    if (!selectedFile) return;

    setLoading(true);
    loadCSVFile(selectedFile.fileName)
      .then((data) => {
        setAllData(data.records);
        setFilteredData(data.records);
        setHeaders(data.headers);

        // Extract unique locations and buildings for filters
        const locs = getUniqueValues(data.records, [
          "location",
          "location_2",
        ]);
        const buildings = getUniqueValues(data.records, [
          "building",
          "building_2",
          "building_3",
          "building_4",
        ]);

        setUniqueLocations(locs);
        setUniqueBuildings(buildings);
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        alert("Failed to load CSV file. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedLocation, locations]);

  // Apply filters and search
  React.useEffect(() => {
    if (allData.length === 0) return;

    let result = allData;

    // Apply search
    if (searchTerm) {
      result = searchRecords(result, searchTerm);
    }

    // Apply filters
    if (locationFilter || buildingFilter) {
      result = filterRecords(result, {
        location: locationFilter,
        building: buildingFilter,
      });
    }

    setFilteredData(result);
  }, [searchTerm, locationFilter, buildingFilter, allData]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setBuildingFilter("");
  };

  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    // Create a worksheet from the filtered data
    const ws = XLSX.utils.json_to_sheet(filteredData);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Data");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
    const locationName = locations.find((loc) => loc.value === selectedLocation)?.label || "data";
    const filename = `${locationName}_filtered_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            CSV Data Dashboard
          </h1>
          <p className="text-muted-foreground">
            Explore and analyze your processed CSV data with interactive
            visualizations
          </p>
        </div>

        {/* Location Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Select Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSelector
              locations={locations}
              value={selectedLocation}
              onChange={setSelectedLocation}
            />
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : selectedLocation && allData.length > 0 ? (
          <>
            {/* Visualizations */}
            <DataVisualizations data={filteredData} />

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Search Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Name, phone, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Location Filter */}
                  {uniqueLocations.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Filter by Location
                      </label>
                      <Select
                        value={locationFilter || "all"}
                        onValueChange={(value) => setLocationFilter(value === "all" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {uniqueLocations.slice(0, 20).map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Building Filter */}
                  {uniqueBuildings.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Filter by Building
                      </label>
                      <Select
                        value={buildingFilter || "all"}
                        onValueChange={(value) => setBuildingFilter(value === "all" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All buildings" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All buildings</SelectItem>
                          {uniqueBuildings.slice(0, 20).map((building) => (
                            <SelectItem key={building} value={building}>
                              {building}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    onClick={handleExportToExcel}
                    disabled={filteredData.length === 0}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export to Excel ({filteredData.length} records)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Data Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={filteredData} headers={headers} />
              </CardContent>
            </Card>
          </>
        ) : (
          !loading &&
          selectedLocation && (
            <Card>
              <CardContent className="py-16">
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available for the selected location.</p>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {!selectedLocation && !loading && (
          <Card>
            <CardContent className="py-16">
              <div className="text-center text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to CSV Data Dashboard</p>
                <p>
                  Select a location above to start exploring your data
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
