import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

interface City {
    _id: string;
    cityName: string;
    count: number;
}

interface ApiResponse {
    cities: City[];
    total: number;
    page: number;
    totalPages: number;
}

const App: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCities, setTotalCities] = useState(0);
    const [loading, setLoading] = useState(false);

    const [newCityName, setNewCityName] = useState('');
    const [newCityCount, setNewCityCount] = useState(1);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchCities = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ApiResponse>('http://localhost:8000/api/cities', {
                params: { search: searchTerm, page }
            });
            setCities(response.data.cities);
            setTotalPages(response.data.totalPages);
            setTotalCities(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCities();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCities();
    };

    const createCity = async () => {
        // Frontend validation
        if (!newCityName.trim()) {
            setErrorMessage('City name cannot be empty.');
            return;
        }

        if (newCityCount < 1) {
            setErrorMessage('Count must be at least 1.');
            return;
        }

        try {
            await axios.post('http://localhost:8000/cities', {
                cityName: newCityName.trim(),
                count: newCityCount
            });

            // Reset form and clear error
            setNewCityName('');
            setNewCityCount(1); // Use 1 as default since 0 is invalid
            setErrorMessage('');
            fetchCities();
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Error creating city.');
            }
            console.error('Error creating city:', error);
        }
    };


    const updateCity = async (city: City) => {
        // Frontend validation
        if (!city.cityName.trim()) {
            setErrorMessage('City name cannot be empty.');
            return;
        }

        if (city.count < 1) {
            setErrorMessage('Count must be at least 1.');
            return;
        }

        try {
            await axios.put(`http://localhost:8000/cities/${city._id}`, {
                cityName: city.cityName.trim(),
                count: city.count
            });
            setErrorMessage(''); // Clear any previous errors
            fetchCities(); // Refresh cities list
        } catch (error: unknown) {
            if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error); // Show backend error
            } else {
                setErrorMessage('Error updating city.');
            }
            console.error('Error updating city:', error);
        }
    };


    const deleteCity = async (cityId: string) => {
        try {
            await axios.delete(`http://localhost:8000/cities/${cityId}`);
            fetchCities();
        } catch (error) {
            console.error('Error deleting city:', error);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-5xl">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-600">City Manager</h1>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="flex justify-center mb-8">
                    <input
                        type="text"
                        placeholder="Search for a city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 max-w-md p-3 border border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        className="bg-indigo-500 text-white px-6 py-3 rounded-r-xl hover:bg-indigo-600 transition-all"
                    >
                        Search
                    </button>
                </form>

                {/* Create City */}
                <div className="flex items-center gap-4 mb-8 justify-center">
                    <input
                        type="text"
                        placeholder="New city name"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg flex-1 max-w-sm"
                    />
                    <input
                        type="number"
                        placeholder="Count"
                        value={newCityCount}
                        onChange={(e) => setNewCityCount(Number(e.target.value))}
                        className="p-3 border border-gray-300 rounded-lg w-32"
                    />
                    <button
                        onClick={createCity}
                        className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-all"
                    >
                        Create
                    </button>
                </div>
                {/* Error Message Display */}
                {errorMessage && (
                    <div className="text-red-500 text-center mb-4">
                        {errorMessage}
                    </div>
                )}

                {/* Total Count */}
                <div className="text-center mb-4 text-gray-600">
                    {totalCities > 0 && <span>Total Cities Found: {totalCities}</span>}
                </div>

                {/* Loading Spinner */}
                {loading ? (
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-solid"></div>
                    </div>
                ) : (
                    <>
                        {cities.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                                    <thead className="bg-indigo-500 text-white">
                                    <tr>
                                        <th className="p-4 text-left">City Name</th>
                                        <th className="p-4 text-left">Count</th>
                                        <th className="p-4 text-center">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <AnimatePresence>
                                        {cities.map((city, index) => (
                                            <motion.tr
                                                key={city._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                                            >
                                                <td className="p-4">
                                                    <input
                                                        type="text"
                                                        value={city.cityName}
                                                        onChange={(e) => {
                                                            const updatedCities = cities.map(c =>
                                                                c._id === city._id ? { ...c, cityName: e.target.value } : c
                                                            );
                                                            setCities(updatedCities);
                                                        }}
                                                        className="p-2 border border-gray-300 rounded w-full"
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input
                                                        type="number"
                                                        value={city.count}
                                                        onChange={(e) => {
                                                            const updatedCities = cities.map(c =>
                                                                c._id === city._id ? { ...c, count: Number(e.target.value) } : c
                                                            );
                                                            setCities(updatedCities);
                                                        }}
                                                        className="p-2 border border-gray-300 rounded w-full"
                                                    />
                                                </td>
                                                <td className="p-4 flex justify-center gap-2">
                                                    <button
                                                        onClick={() => updateCity(city)}
                                                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-all"
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to delete ${city.cityName}?`)) {
                                                                deleteCity(city._id);
                                                            }
                                                        }}
                                                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-all"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">No cities found.</div>
                        )}

                        {/* Pagination Controls */}
                        <div className="flex justify-between mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                className="px-4 py-2 bg-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-400 transition-all"
                            >
                                Previous
                            </button>
                            <span className="text-gray-700 font-medium">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                className="px-4 py-2 bg-gray-300 rounded-xl disabled:opacity-50 hover:bg-gray-400 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default App;
