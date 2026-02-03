import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AssetsPage from './pages/assets/InventoryPage';
import NewAssetPage from './pages/assets/NewAssetPage';
import EditAssetPage from './pages/assets/EditAssetPage';
import LocationsPage from './pages/settings/LocationsPage';
import TagSettings from './pages/settings/TagSettingsPage';
import AssetCategoryPage from './pages/settings/AssetCategoryPage';
import UsersPage from './pages/UsersPage';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[#FDFCFB]">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/assets" replace />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/assets/new" element={<NewAssetPage />} />
                    <Route path="/assets/edit/:id" element={<EditAssetPage />} />
                    <Route path="/settings/locations" element={<LocationsPage />} />
                    <Route path="/settings/tags" element={<TagSettings />} />
                    <Route path="/settings/asset-category" element={<AssetCategoryPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    {/* Fallback */}
                    <Route path="*" element={<div className="p-8">Page Not Found</div>} />
                </Routes>
            </Layout>
        </Router>
    );
}
