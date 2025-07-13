"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

interface User {
  id: number;
  email: string;
  username: string;
  name: string | null;
  createdAt: string;
}

interface ServiceProvider {
  id: number;
  email: string;
  username: string;
  name: string | null;
  serviceType: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  service: {
    id: number;
    name: string;
    provider: {
      id: number;
      name: string | null;
      username: string;
      email: string;
      serviceType: string;
    }
  };
  customer: {
    id: number;
    name: string | null;
    username: string;
    email: string;
  };
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  provider: {
    id: number;
    name: string | null;
    username: string;
    email: string;
    serviceType: string;
  };
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string | null;
    username: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
    provider: {
      id: number;
      name: string | null;
      username: string;
      email: string;
      serviceType: string;
    };
  };
  booking: {
    id: number;
    status: string;
    scheduledDate: string;
  };
}

type AdminTableProps = {
  type: 'users' | 'providers' | 'bookings' | 'services' | 'reviews';
  data: User[] | ServiceProvider[] | Booking[] | Service[] | Review[];
  onDelete?: (id: number) => void;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onRowClick?: (id: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function AdminTable({ type, data, onDelete, onEdit, onView, onRowClick }: AdminTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState<string>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const filteredData = useMemo(() => {
    return data.filter((item: any) => {
      const searchableFields = Object.values(item).join(' ').toLowerCase();
      return searchableFields.includes(searchTerm.toLowerCase());
    })
  }, [data, searchTerm])

  const sortedData = useMemo(() => {
    return filteredData.sort((a: any, b: any) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // Handle nested objects
      if (sortColumn.includes('.')) {
        const keys = sortColumn.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`
  }

  const renderTableHeaders = () => {
    switch (type) {
      case 'users':
        return (
          <>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              No {sortColumn === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("username")}>
              Username {sortColumn === "username" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
              Email {sortColumn === "email" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortColumn === "name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
              Created {sortColumn === "createdAt" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
          </>
        );
      case 'providers':
        return (
          <>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              No {sortColumn === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("username")}>
              Username {sortColumn === "username" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
              Email {sortColumn === "email" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("serviceType")}>
              Service Type {sortColumn === "serviceType" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("phone")}>
              Phone {sortColumn === "phone" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("address")}>
              Shop Location {sortColumn === "address" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
              Created {sortColumn === "createdAt" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
          </>
        );
      case 'bookings':
        return (
          <>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              No {sortColumn === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("customerName")}>
              Customer {sortColumn === "customerName" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("service.name")}>
              Service {sortColumn === "service.name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("scheduledDate")}>
              Date {sortColumn === "scheduledDate" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
              Status {sortColumn === "status" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("customerAddress")}>
              Booking Location {sortColumn === "customerAddress" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("totalAmount")}>
              Amount {sortColumn === "totalAmount" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
          </>
        );
      case 'services':
        return (
          <>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              No {sortColumn === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              Name {sortColumn === "name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
              Category {sortColumn === "category" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
              Price {sortColumn === "price" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("provider.name")}>
              Provider {sortColumn === "provider.name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
              Created {sortColumn === "createdAt" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
          </>
        );
      case 'reviews':
        return (
          <>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              No {sortColumn === "id" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("customer.name")}>
              Customer {sortColumn === "customer.name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("service.provider.name")}>
              Provider {sortColumn === "service.provider.name" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
              Rating {sortColumn === "rating" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Provider Response</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
              Created {sortColumn === "createdAt" && <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>}
            </TableHead>
          </>
        );
    }
  }

  const renderTableRows = () => {
    return sortedData.map((item: any, index: number) => {
      switch (type) {
        case 'users':
          const user = item as User;
          return (
            <TableRow 
              key={user.id} 
              className="hover:bg-blue-50/50 transition-colors duration-200 border-b border-gray-100/50 cursor-pointer" 
              onClick={() => onRowClick && onRowClick(user.id)}
            >
              <TableCell className="font-semibold text-gray-900 py-4">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium py-4">{user.username}</TableCell>
              <TableCell className="text-gray-700 py-4">{user.email}</TableCell>
              <TableCell className="text-gray-700 py-4">{user.name || <span className="text-gray-400 italic">N/A</span>}</TableCell>
              <TableCell className="text-gray-600 py-4">{formatDate(user.createdAt)}</TableCell>
              <TableCell className="py-4">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'providers':
          const provider = item as ServiceProvider;
          return (
            <TableRow 
              key={provider.id} 
              className="hover:bg-green-50/50 transition-colors duration-200 border-b border-gray-100/50 cursor-pointer" 
              onClick={() => onRowClick && onRowClick(provider.id)}
            >
              <TableCell className="font-semibold text-gray-900 py-4">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium py-4">{provider.username}</TableCell>
              <TableCell className="text-gray-700 py-4">{provider.email}</TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300 text-green-800 font-medium">
                  {provider.serviceType}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-700 py-4">{provider.phone || <span className="text-gray-400 italic">N/A</span>}</TableCell>
              <TableCell className="text-gray-700 py-4 max-w-xs">
                <div className="truncate" title={provider.address || "N/A"}>
                  {provider.address || <span className="text-gray-400 italic">N/A</span>}
                </div>
              </TableCell>
              <TableCell className="text-gray-600 py-4">{formatDate(provider.createdAt)}</TableCell>
              <TableCell className="py-4">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(provider.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(provider.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'bookings':
          const booking = item as Booking;
          return (
            <TableRow 
              key={booking.id} 
              className="hover:bg-orange-50/50 transition-colors duration-200 border-b border-gray-100/50 cursor-pointer" 
              onClick={() => onRowClick && onRowClick(booking.id)}
            >
              <TableCell className="font-semibold text-gray-900 py-4">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium py-4">{booking.customerName}</TableCell>
              <TableCell className="text-gray-700 py-4">{booking.service.name}</TableCell>
              <TableCell className="text-gray-700 py-4">
                <div className="text-sm">
                  <div className="font-medium">{formatDate(booking.scheduledDate)}</div>
                  <div className="text-gray-500">{booking.scheduledTime}</div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge className={`${getStatusColor(booking.status)} font-medium`}>{booking.status}</Badge>
              </TableCell>
              <TableCell className="text-gray-700 py-4 max-w-xs">
                <div className="truncate" title={booking.customerAddress || "N/A"}>
                  {booking.customerAddress || <span className="text-gray-400 italic">N/A</span>}
                </div>
              </TableCell>
              <TableCell className="text-gray-800 font-semibold py-4">{formatCurrency(booking.totalAmount)}</TableCell>
              <TableCell className="py-4">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(booking.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(booking.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'services':
          const service = item as Service;
          return (
            <TableRow 
              key={service.id} 
              className="hover:bg-purple-50/50 transition-colors duration-200 border-b border-gray-100/50 cursor-pointer" 
              onClick={() => onRowClick && onRowClick(service.id)}
            >
              <TableCell className="font-semibold text-gray-900 py-4">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium py-4">{service.name}</TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 text-purple-800 font-medium">
                  {service.category}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-800 font-semibold py-4">{formatCurrency(service.price)}</TableCell>
              <TableCell className="text-gray-700 py-4">{service.provider.name || service.provider.username}</TableCell>
              <TableCell className="text-gray-600 py-4">{formatDate(service.createdAt)}</TableCell>
              <TableCell className="py-4">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(service.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(service.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        case 'reviews':
          const review = item as Review;
          return (
            <TableRow 
              key={review.id} 
              className="hover:bg-yellow-50/50 transition-colors duration-200 border-b border-gray-100/50 cursor-pointer" 
              onClick={() => onRowClick && onRowClick(review.id)}
            >
              <TableCell className="font-semibold text-gray-900 py-4">
                {index + 1}
              </TableCell>
              <TableCell className="text-gray-800 font-medium py-4">{review.customer.name || review.customer.username}</TableCell>
              <TableCell className="text-gray-700 py-4">{review.service.provider.name || review.service.provider.username}</TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-semibold text-sm">{review.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-xs py-4">
                <div className="text-gray-700 text-sm truncate">
                  {review.comment || <span className="text-gray-400 italic">No comment</span>}
                </div>
              </TableCell>
              <TableCell className="max-w-xs py-4">
                <div className="text-gray-700 text-sm truncate">
                  {review.providerComment || <span className="text-gray-400 italic">No response</span>}
                </div>
              </TableCell>
              <TableCell className="text-gray-600 py-4">{formatDate(review.createdAt)}</TableCell>
              <TableCell className="py-4">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(review.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(review.id);
                      }}
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        default:
          return null;
      }
    });
  }

  const getTableTitle = () => {
    switch (type) {
      case 'users': return 'Users';
      case 'providers': return 'Service Providers';
      case 'bookings': return 'Bookings';
      case 'services': return 'Services';
      case 'reviews': return 'Reviews';
      default: return 'Data';
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-black/10 border border-white/30 overflow-hidden">
      {/* Modern Table Header */}
      <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                {getTableTitle()}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage and organize your {getTableTitle().toLowerCase()}</p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder={`Search ${getTableTitle().toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 bg-white/70 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Modern Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 hover:bg-gray-50/70 border-b border-gray-200/50">
              {renderTableHeaders()}
              <TableHead className="text-gray-700 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableRows()}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {sortedData.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No {getTableTitle().toLowerCase()} found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add new {getTableTitle().toLowerCase()}</p>
        </div>
      )}
    </div>
  )
} 