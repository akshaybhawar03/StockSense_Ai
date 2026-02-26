import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    User, Building2, Package, BrainCircuit, Bell, Plug,
    ShieldCheck, CreditCard, Database, Palette,
    Upload, Key, Smartphone, Download, RefreshCw, LogOut, Link2, Unlink2, CheckCircle2, AlertCircle, HardDrive
} from 'lucide-react';

export function DashboardSettings() {
    const { mode, toggleMode, accentColor, setAccentColor } = useTheme();
    const { language, setLanguage } = useLanguage();
    const [activeSection, setActiveSection] = useState('profile');

    const sections = [
        { id: 'profile', label: 'Profile Settings', icon: User, desc: 'Manage your personal details and role' },
        { id: 'business', label: 'Business Settings', icon: Building2, desc: 'Update business information and tax details' },
        { id: 'inventory', label: 'Inventory Preferences', icon: Package, desc: 'Configure stock thresholds and tracking' },
        { id: 'ai', label: 'AI Prediction Settings', icon: BrainCircuit, desc: 'Tune AI forecasting and alerts' },
        { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Manage email, SMS, and WhatsApp alerts' },
        { id: 'integration', label: 'Integration Settings', icon: Plug, desc: 'Connect to external sales channels' },
        { id: 'security', label: 'Security Settings', icon: ShieldCheck, desc: 'Protect your account and login activity' },
        { id: 'billing', label: 'Billing & Subscription', icon: CreditCard, desc: 'Manage invoices and plans' },
        { id: 'data', label: 'Data & Backup', icon: Database, desc: 'Export, import, and backup your data' },
        { id: 'appearance', label: 'Appearance Settings', icon: Palette, desc: 'Customize themes and language' }
    ];

    const SectionHeader = ({ title, description }: { title: string, description: string }) => (
        <div className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
    );

    const SaveButton = ({ label = "Save Changes" }: { label?: string }) => (
        <div className="mt-8 flex justify-end">
            <Button className="bg-[rgb(var(--accent-primary))] text-white hover:bg-[rgb(var(--accent-primary))]/90 px-8">
                {label}
            </Button>
        </div>
    );

    // Render components for each section
    const renderProfileSettings = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Profile Settings" description="Manage your public profile and personal information." />

            <div className="flex items-center gap-6 mb-8 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                        JD
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full shadow-md border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <Upload className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Profile Photo</h3>
                    <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. Max size of 800K</p>
                    <div className="flex gap-3">
                        <Button size="sm" variant="outline">Upload New</Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">Remove</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="John Doe" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="admin@stocksense.ai" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 000-0000" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue="Admin" disabled className="bg-gray-50 dark:bg-gray-800/50 opacity-70" />
                </div>
            </div>

            <SaveButton />
        </motion.div>
    );

    const renderBusinessSettings = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Business Settings" description="Update your corporate entity and operational preferences." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" defaultValue="Acme Retail Corp" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gst">GST / Tax Number</Label>
                    <Input id="gst" defaultValue="GSTIN12345678" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="businessType">Business Type</Label>
                    <select id="businessType" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50">
                        <option>Retail</option>
                        <option>Wholesale</option>
                        <option>E-commerce</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Warehouse Location</Label>
                    <Input id="location" defaultValue="New York, NY" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <select id="currency" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50">
                        <option>USD ($)</option>
                        <option>INR (₹)</option>
                        <option>EUR (€)</option>
                        <option>GBP (£)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fiscalYear">Financial Year Starts</Label>
                    <select id="fiscalYear" className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] disabled:cursor-not-allowed dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50">
                        <option>January 1</option>
                        <option>April 1</option>
                        <option>July 1</option>
                    </select>
                </div>
            </div>

            <SaveButton label="Save Business Settings" />
        </motion.div>
    );

    const renderInventoryPreferences = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Inventory Preferences" description="Configure core inventory tracking logic and thresholds." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <Label>Default Low Stock Threshold (Units)</Label>
                    <Input type="number" defaultValue="20" className="bg-white dark:bg-gray-900" />
                </div>
                <div className="space-y-2">
                    <Label>Default Stock Category</Label>
                    <Input defaultValue="General Electronics" className="bg-white dark:bg-gray-900" />
                </div>
            </div>

            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Auto SKU Generator</Label>
                        <p className="text-sm text-gray-500">Automatically generate sequential SKUs for new items</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Enable Barcode Scanning</Label>
                        <p className="text-sm text-gray-500">Allow scanning barcodes in the Add Product flow</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Multi-Warehouse Support</Label>
                        <p className="text-sm text-gray-500">Track items across different physical locations</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Enable Batch Tracking</Label>
                        <p className="text-sm text-gray-500">Track expirations grouped by manufacturing batches</p>
                    </div>
                    <Switch />
                </div>
            </div>

            <SaveButton label="Save Inventory Settings" />
        </motion.div>
    );

    const renderAI = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="AI Prediction Settings" description="Fine-tune how StockSense uses machine learning on your data." />

            <div className="p-6 bg-gradient-to-r from-[rgb(var(--accent-primary))]/10 to-transparent rounded-2xl border border-[rgb(var(--accent-primary))]/20 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent-primary))] flex items-center justify-center text-white">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Smart Demand Forecasting</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Uses machine learning to predict upcoming sales</p>
                        </div>
                    </div>
                    <Switch defaultChecked />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                    <Label>Prediction Sensitivity</Label>
                    <select className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50">
                        <option>Low (Conservative)</option>
                        <option>Medium (Balanced)</option>
                        <option>High (Aggressive)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>Days Before Stockout Alert</Label>
                    <Input type="number" defaultValue="14" className="bg-white dark:bg-gray-900" />
                </div>
            </div>

            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Enable AI Reorder Prediction</Label>
                        <p className="text-sm text-gray-500">Get automatic restock quantities</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Auto Reorder Creation</Label>
                        <p className="text-sm text-gray-500">Automatically draft purchase orders</p>
                    </div>
                    <Switch />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Dead Stock Detection</Label>
                        <p className="text-sm text-gray-500">Analyze items locking up capital</p>
                    </div>
                    <Switch defaultChecked />
                </div>
            </div>

            <SaveButton label="Save AI Settings" />
        </motion.div>
    );

    const renderNotifications = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Notification Settings" description="Choose how and when you want to be alerted." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Channels</h3>

                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Push Notifications</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Email Alerts</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal flex items-center gap-2">
                            SMS Alerts <Badge variant="secondary" className="text-xs">Pro</Badge>
                        </Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal flex items-center gap-2">
                            WhatsApp Alerts <Badge variant="secondary" className="text-xs">Pro</Badge>
                        </Label>
                        <Switch />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Event Triggers</h3>

                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Low Stock Alerts</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Dead Stock Discovery</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Weekly Performance Report</Label>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-normal">Monthly Analytics Report</Label>
                        <Switch defaultChecked />
                    </div>
                </div>
            </div>

            <SaveButton label="Save Notification Settings" />
        </motion.div>
    );

    const renderIntegrations = () => {
        const platforms = [
            { name: 'Shopify', logo: '/logos/shopify.svg', status: 'connected', autoSync: true },
            { name: 'Amazon', logo: '/logos/amazon.svg', status: 'connected', autoSync: true },
            { name: 'Flipkart', logo: '/logos/flipkart.svg', status: 'disconnected', autoSync: false },
            { name: 'WooCommerce', logo: '/logos/woocommerce.png', status: 'disconnected', autoSync: false },
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <SectionHeader title="Integration Settings" description="Connect your sales channels and external tools." />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {platforms.map((platform, idx) => (
                        <Card key={idx} className="p-6 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center p-2 border border-gray-100 dark:border-gray-800">
                                        <img src={platform.logo} alt={platform.name} className="max-w-full max-h-full object-contain" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">{platform.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${platform.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">{platform.status}</span>
                                        </div>
                                    </div>
                                </div>
                                {platform.status === 'connected' ? (
                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:hover:bg-red-900/20">
                                        <Unlink2 className="w-3.5 h-3.5 mr-1" /> Disconnect
                                    </Button>
                                ) : (
                                    <Button size="sm" className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                                        <Link2 className="w-3.5 h-3.5 mr-1" /> Connect
                                    </Button>
                                )}
                            </div>

                            {platform.status === 'connected' && (
                                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Sync: 10 mins ago</span>
                                    </div>
                                    <Button variant="secondary" size="sm">Sync Now</Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </motion.div>
        );
    };

    const renderSecurity = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <SectionHeader title="Security Settings" description="Protect your account with advanced security configurations." />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Key className="w-4 h-4 text-gray-500" /> Change Password
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Update your password regularly to keep your account secure</p>
                    </div>
                    <Button variant="outline">Update Password</Button>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-500" /> Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="default" className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900">Enable 2FA</Button>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-gray-700"></div>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-500" /> Data Encryption
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Your data is secured with AES-256 bank-level encryption.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Active Devices</h3>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="w-4 h-4 mr-2" /> Logout All
                    </Button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">iPhone 13 Pro</p>
                                <p className="text-xs text-gray-500">Mumbai, India • Last active 2 mins ago</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">Current Session</Badge>
                    </div>
                    <div className="flex items-center gap-4 pb-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Chrome on Windows</p>
                            <p className="text-xs text-gray-500">New Delhi, India • Last active 3 hrs ago</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderBilling = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Billing & Subscription" description="Manage your billing cycle, payment methods, and invoices." />

            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--accent-primary))]/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))] text-white border-0">PRO PLAN</Badge>
                            <span className="text-gray-400 text-sm">Billed Annually</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-1">₹2,999<span className="text-lg text-gray-400 font-normal">/month</span></h2>
                        <p className="text-gray-300">Renews automatically on Oct 15, 2026</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button className="bg-white text-gray-900 hover:bg-gray-100 w-full sm:w-auto">Upgrade to Enterprise</Button>
                        <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 w-full sm:w-auto">Cancel Plan</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Payment Method</h3>
                        <Button variant="ghost" size="sm" className="text-[rgb(var(--accent-primary))] font-medium">Edit</Button>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <div className="w-12 h-8 bg-gray-100 dark:bg-gray-900 rounded flex items-center justify-center">
                            <span className="font-bold text-blue-800 text-xs italic">VISA</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">•••• •••• •••• 4242</p>
                            <p className="text-xs text-gray-500">Expires 12/28</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-6">Auto Renewal</h3>
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Continuous Service</p>
                            <p className="text-xs text-gray-500 mt-1">Automatically renew subscription using defaults</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Billing History</h3>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                        { date: 'Oct 15, 2025', amount: '₹35,988', status: 'Paid', invoice: '#INV-2025-010' },
                        { date: 'Oct 15, 2024', amount: '₹35,988', status: 'Paid', invoice: '#INV-2024-009' }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{item.date}</div>
                                <div className="text-sm text-gray-500">{item.amount}</div>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 dark:bg-green-900/30 dark:text-green-400">{item.status}</Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                                <Download className="w-4 h-4 mr-2" /> PDF
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </motion.div>
    );

    const renderData = () => (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <SectionHeader title="Data & Backup" description="Safeguard your inventory records and export data for reporting." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-[rgb(var(--accent-primary))]/10 rounded-xl flex items-center justify-center text-[rgb(var(--accent-primary))] mb-4">
                        <HardDrive className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Create Backup</h3>
                    <p className="text-sm text-gray-500 mb-6">Manually backup your complete inventory, supplier details, and settings.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Last backup: 2 hours ago</span>
                        <Button className="bg-[rgb(var(--accent-primary))] text-white hover:bg-[rgb(var(--accent-primary))]/90">
                            Backup Now
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                        <Upload className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Import Data</h3>
                    <p className="text-sm text-gray-500 mb-6">Bulk upload items using a CSV or Excel template file.</p>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="w-full">Download Template</Button>
                        <Button variant="default" className="w-full bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900">Upload CSV</Button>
                    </div>
                </Card>
            </div>

            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base">Auto Daily Backup</Label>
                        <p className="text-sm text-gray-500">System securely creates an encrypted backup every 24hrs</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base text-gray-900 dark:text-white">Export Inventory (CSV)</Label>
                        <p className="text-sm text-gray-500">Download your current stock list for offline viewing</p>
                    </div>
                    <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-base text-red-600 dark:text-red-400">Restore Previous Backup</Label>
                        <p className="text-sm text-gray-500">Rollback your inventory state to an older point in time</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20">Restore</Button>
                </div>
            </div>
        </motion.div>
    );

    const renderAppearance = () => {
        const accentColors = [
            { name: 'blue', color: 'bg-blue-500' },
            { name: 'green', color: 'bg-green-500' },
            { name: 'purple', color: 'bg-purple-500' },
            { name: 'orange', color: 'bg-orange-500' },
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <SectionHeader title="Appearance Settings" description="Customize how StockSense looks and feels on your device." />

                <div className="space-y-4">
                    <Label className="text-lg">Theme Mode</Label>
                    <div className="grid grid-cols-2 gap-4 max-w-md">
                        <button
                            onClick={() => { if (mode !== 'light') toggleMode() }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mode === 'light' ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <div className="w-full h-24 bg-gray-100 rounded-md border border-gray-200 shadow-inner flex flex-col p-2 space-y-2">
                                <div className="w-full h-4 bg-white rounded"></div>
                                <div className="w-1/2 h-2 bg-white rounded"></div>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Light Mode</span>
                        </button>

                        <button
                            onClick={() => { if (mode !== 'dark') toggleMode() }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${mode === 'dark' ? 'border-[rgb(var(--accent-primary))] bg-[rgb(var(--accent-primary))]/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`}
                        >
                            <div className="w-full h-24 bg-gray-900 rounded-md border border-gray-800 shadow-inner flex flex-col p-2 space-y-2">
                                <div className="w-full h-4 bg-gray-800 rounded"></div>
                                <div className="w-1/2 h-2 bg-gray-800 rounded"></div>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                        </button>
                    </div>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>

                <div className="space-y-4">
                    <Label className="text-lg">Accent Color</Label>
                    <div className="flex gap-4">
                        {accentColors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => setAccentColor(color.name as any)}
                                className={`w-12 h-12 rounded-full ${color.color} flex items-center justify-center transition-transform hover:scale-110 ${accentColor === color.name ? 'ring-4 ring-offset-4 ring-gray-900 dark:ring-white dark:ring-offset-gray-900' : ''}`}
                            >
                                {accentColor === color.name && <CheckCircle2 className="w-6 h-6 text-white" />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                    <div className="space-y-3">
                        <Label className="text-lg">Language</Label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
                            className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50"
                        >
                            <option value="en">English (US)</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="mr">मराठी (Marathi)</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-lg">Layout Density</Label>
                        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compact Mode</span>
                            <Switch />
                        </div>
                    </div>
                </div>

            </motion.div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Settings</h1>
                <p className="text-gray-500">Manage your account settings, preferences, and subscriptions.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Sidebar Menu */}
                <Card className="w-full lg:w-72 flex-shrink-0 p-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-100 dark:border-gray-800 shadow-sm h-fit lg:sticky lg:top-24">
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const isActive = activeSection === section.id;
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] dark:bg-[rgb(var(--accent-primary))]/20'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? '' : 'text-gray-400'}`} />
                                    {section.label}
                                </button>
                            );
                        })}
                    </nav>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <Card className="p-6 sm:p-8 bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 shadow-lg min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeSection} className="h-full">
                                {activeSection === 'profile' && renderProfileSettings()}
                                {activeSection === 'business' && renderBusinessSettings()}
                                {activeSection === 'inventory' && renderInventoryPreferences()}
                                {activeSection === 'ai' && renderAI()}
                                {activeSection === 'notifications' && renderNotifications()}
                                {activeSection === 'integration' && renderIntegrations()}
                                {activeSection === 'security' && renderSecurity()}
                                {activeSection === 'billing' && renderBilling()}
                                {activeSection === 'data' && renderData()}
                                {activeSection === 'appearance' && renderAppearance()}
                            </motion.div>
                        </AnimatePresence>
                    </Card>
                </div>
            </div>
        </div>
    );
}
