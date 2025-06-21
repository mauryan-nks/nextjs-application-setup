import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, PlusCircle, Filter, X, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewUserForm } from "@/components/admin/NewUserForm";
import { EditUserForm } from "@/components/admin/EditUserForm";
import { UserTransactions } from "@/components/admin/UserTransactions";
import { PanelAccessManagement } from "@/components/admin/PanelAccessManagement";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { User, UserTransaction } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample users data
const sampleUsers: User[] = [
  {
    id: "user123",
    name: "John Doe",
    email: "john@example.com",
    phone: "123-456-7890",
    role: "admin",
    organization: "Example Corp",
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    salesData: {
      totalSales: 1000,
      commissionRate: 0.05,
      paidAmount: 800,
      pendingAmount: 200,
      lastPaymentDate: new Date().toISOString()
    },
    panelAccess: {
      dashboard: true,
      contracts: true,
      analytics: true,
      settings: true,
      sellers: true
    },
    brands: ["Brand A", "Brand B"],
    transactions: [
      {
        id: "txn1",
        date: new Date().toISOString(),
        amount: 500,
        type: 'credit',
        description: "Initial payment",
        status: 'completed'
      }
    ]
  },
  {
    id: "user456",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "123-456-7891",
    role: "user",
    organization: "OEM Partners",
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    salesData: {
      totalSales: 2500,
      commissionRate: 0.04,
      paidAmount: 2000,
      pendingAmount: 500,
      lastPaymentDate: new Date().toISOString()
    },
    panelAccess: {
      dashboard: true,
      contracts: true,
      analytics: true,
      settings: false,
      sellers: true
    },
    brands: ["Brand C"]
  },
  {
    id: "user789",
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "123-456-7892",
    role: "user",
    organization: "XYZ Industries",
    isActive: false,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    salesData: {
      totalSales: 500,
      commissionRate: 0.05,
      paidAmount: 300,
      pendingAmount: 200,
      lastPaymentDate: null
    },
    panelAccess: {
      dashboard: true,
      contracts: false,
      analytics: true,
      settings: false,
      sellers: false
    },
    brands: []
  }
];

const UserManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    organization: ""
  });
  const [users, setUsers] = useState(sampleUsers);
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Search term filter
    if (searchTerm && 
        !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.organization.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Role filter
    if (filters.role && user.role !== filters.role.toLowerCase()) {
      return false;
    }
    
    // Status filter
    if (filters.status) {
      if (filters.status === "active" && !user.isActive) return false;
      if (filters.status === "inactive" && user.isActive) return false;
    }
    
    // Organization filter
    if (filters.organization && !user.organization.includes(filters.organization)) {
      return false;
    }
    
    return true;
  });

  const resetFilters = () => {
    setFilters({
      role: "",
      status: "",
      organization: ""
    });
    setSearchTerm("");
  };

  const handleAddUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: `user${Date.now()}`,
      name: userData.name || "",
      email: userData.email || "",
      phone: userData.phone || "",
      role: userData.role || "user",
      organization: userData.organization || "",
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      salesData: {
        totalSales: 0,
        commissionRate: 0.05,
        paidAmount: 0,
        pendingAmount: 0,
        lastPaymentDate: null
      },
      panelAccess: userData.panelAccess || {
        dashboard: true,
        contracts: true,
        analytics: true,
        settings: true,
        sellers: true
      },
      brands: userData.brands || []
    };
    
    // Add initial payment if specified
    if (userData.initialPayment && userData.initialPayment > 0) {
      newUser.transactions = [{
        id: `txn${Date.now()}`,
        date: new Date().toISOString(),
        amount: userData.initialPayment,
        type: 'credit',
        description: 'Initial payment',
        status: 'pending'
      }];
    }
    
    setUsers([...users, newUser]);
    
    toast({
      title: "User Added Successfully",
      description: `${newUser.name} has been added to the system.`,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (!editingUser) return;

    const updatedUsers = users.map(user => 
      user.id === editingUser.id 
        ? { ...user, ...userData }
        : user
    );
    
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setEditingUser(null);

    toast({
      title: "User Updated Successfully",
      description: `${userData.name} has been updated.`,
    });
  };

  const handleUpdateUserFromPanel = (userId: string, userData: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    );
    
    setUsers(updatedUsers);
  };

  const handleAddTransaction = (userId: string, transaction: Omit<UserTransaction, 'id'>) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const newTransaction: UserTransaction = {
          id: `txn${Date.now()}`,
          ...transaction
        };
        
        return {
          ...user,
          transactions: [...(user.transactions || []), newTransaction],
          salesData: {
            ...user.salesData,
            paidAmount: 
              transaction.type === 'credit' 
                ? user.salesData.paidAmount + Math.abs(transaction.amount)
                : user.salesData.paidAmount - Math.abs(transaction.amount),
          }
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <Badge variant="outline" className="text-sm">
            {users.length} Total Users
          </Badge>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-[600px]">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="access">Access Management</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="pt-6 space-y-6">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Search & Filter Users</span>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 lg:px-3"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 lg:px-3"
                      onClick={resetFilters}
                      disabled={!Object.values(filters).some(v => v !== "") && !searchTerm}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search by name, email, or organization"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add New User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Create a new user account in the system.
                          </DialogDescription>
                        </DialogHeader>
                        <NewUserForm onSubmit={handleAddUser} />
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Role</label>
                        <select 
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={filters.role}
                          onChange={(e) => setFilters({...filters, role: e.target.value})}
                        >
                          <option value="">All Roles</option>
                          <option value="admin">Administrator</option>
                          <option value="user">OEM User</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Status</label>
                        <select 
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">All Statuses</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">Organization</label>
                        <Input 
                          placeholder="Filter by organization"
                          value={filters.organization}
                          onChange={(e) => setFilters({...filters, organization: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Users List</CardTitle>
                <CardDescription>Manage all system users and their access permissions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Assigned Brands</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.organization}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                {user.role === "admin" ? "Administrator" : "OEM User"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                            </TableCell>
                            <TableCell>
                              {user.brands && user.brands.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.brands.slice(0, 2).map((brand) => (
                                    <span key={brand} className="text-xs bg-gray-100 rounded-full px-2 py-1">
                                      {brand}
                                    </span>
                                  ))}
                                  {user.brands.length > 2 && (
                                    <span className="text-xs bg-gray-100 rounded-full px-2 py-1">
                                      +{user.brands.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">None</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No users found matching the search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <div className="text-sm text-gray-500">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="access" className="pt-6">
            <PanelAccessManagement 
              users={users} 
              onUpdateUser={handleUpdateUserFromPanel}
            />
          </TabsContent>
          
          <TabsContent value="transactions" className="pt-6">
            <UserTransactions users={users} onAddTransaction={handleAddTransaction} />
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
              <DialogDescription>
                Update user information, permissions, and access settings.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <EditUserForm
                user={editingUser}
                onSubmit={handleUpdateUser}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
