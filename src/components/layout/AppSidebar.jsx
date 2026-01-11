import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Avatar from 'boring-avatars';
import {
    LayoutDashboard,
    Wrench,
    Settings2,
    Settings,
    AlertTriangle,
    Users,
    Building2,
    LogOut,
    ChevronUp,
    Package,
    Truck,
    User,
    Calendar,
    ClipboardList,
    Shield,
    Clock,
    Bell,
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const adminNavGroups = [
    {
        title: 'Principal',
        items: [
            { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Opérations',
        items: [
            { name: 'Calendrier', path: '/calendar', icon: Calendar },
            { name: 'Ordres de travail', path: '/workorders', icon: ClipboardList },
            { name: 'Machines', path: '/machines', icon: Settings2 },
        ],
    },
    {
        title: 'Inventaire',
        items: [
            { name: 'Pièces', path: '/pieces', icon: Package },
            { name: 'Historique Stock', path: '/stock-history', icon: Clock },
            { name: 'Fournisseurs', path: '/fournisseurs', icon: Truck },
        ],
    },
    {
        title: 'Clients',
        items: [
            { name: 'Clients', path: '/clients', icon: Building2 },
        ],
    },
    {
        title: 'Administration',
        items: [
            { name: 'Utilisateurs', path: '/users', icon: User },
            { name: 'Rôles', path: '/roles', icon: Shield },
            { name: 'Notifications', path: '/my-notifications', icon: Bell },
            { name: 'Paramètres', path: '/settings', icon: Settings },
        ],
    },
];

const techNavGroups = [
    {
        title: 'Principal',
        items: [
            { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Calendrier', path: '/calendar', icon: Calendar },
            { name: 'Mes Ordres', path: '/workorders', icon: ClipboardList },
        ],
    },
];

const receptionistNavGroups = [
    {
        title: 'Principal',
        items: [
            { name: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Gestion',
        items: [
            { name: 'Calendrier', path: '/calendar', icon: Calendar },
            { name: 'Ordres de travail', path: '/workorders', icon: ClipboardList },
            { name: 'Machines', path: '/machines', icon: Settings2 },
            { name: 'Clients', path: '/clients', icon: Building2 },
        ],
    },
];

export function AppSidebar() {
    const { user, logout, isAdmin, isReceptionist } = useAuth();
    const navigate = useNavigate();

    // Determine which nav groups to show based on role
    let navGroups = techNavGroups;
    if (isAdmin()) {
        navGroups = adminNavGroups;
    } else if (isReceptionist()) {
        navGroups = receptionistNavGroups;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm">MaintenancePro</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {isAdmin() ? 'Admin Panel' : isReceptionist() ? 'Réception' : 'Technicien'}
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton asChild>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                                                }
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.name}</span>
                                            </NavLink>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <Avatar
                                        size={24}
                                        name={user?.email || 'User'}
                                        variant="beam"
                                        colors={['#64748B', '#F59E0B', '#22C55E', '#3B82F6', '#EF4444']}
                                    />
                                    <span className="truncate">
                                        {user?.email?.split('@')[0] || 'Utilisateur'}
                                    </span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem onClick={() => navigate('/profile')}>
                                    <User className="w-4 h-4 mr-2" />
                                    Mon Profil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
