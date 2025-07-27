"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import {
  TruckIcon,
  CalendarIcon,
  MapPinIcon,
  PackageIcon,
  RefreshCwIcon,
  ClockIcon,
  CheckCircleIcon,
} from "lucide-react";

interface WaitingListEntry {
  payment_id: number;
  user_name: string;
  institution: string;
  payment_completed_at: string;
  shipping_status: string;
  shipping_region: string;
  batch_name: string | null;
  estimated_shipping: string;
}

interface WaitingListResponse {
  success: boolean;
  data: WaitingListEntry[];
  total: number;
  country: string;
  message: string;
}

export default function CardWaitingListPage() {
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

  const fetchWaitingList = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<WaitingListResponse>(
        `${apiBaseUrl}/academic-card-payments/waiting-list`,
        {
          params: {
            limit: 100,
            country: 'Indonesia'
          }
        }
      );

      if (response.data.success) {
        setWaitingList(response.data.data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to load waiting list');
      }
    } catch (err) {
      console.error('Error fetching waiting list:', err);
      setError('Failed to load waiting list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'batched': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'batched': return <PackageIcon className="h-4 w-4" />;
      case 'shipped': return <TruckIcon className="h-4 w-4" />;
      case 'delivered': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = {
    total: waitingList.length,
    pending: waitingList.filter(item => item.shipping_status === 'pending').length,
    batched: waitingList.filter(item => item.shipping_status === 'batched').length,
    shipped: waitingList.filter(item => item.shipping_status === 'shipped').length,
    delivered: waitingList.filter(item => item.shipping_status === 'delivered').length,
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Academic Card Waiting List</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track the status of Academic Card purchases and shipments across Indonesia. 
          Physical cards are printed and shipped in batches.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>Last updated: {lastUpdated.toLocaleString()}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWaitingList}
            disabled={isLoading}
          >
            <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.batched}</div>
            <div className="text-sm text-muted-foreground">In Production</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.shipped}</div>
            <div className="text-sm text-muted-foreground">Shipped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
            <div className="text-sm text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Shipping Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Shipping Timeline</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Batch creation: Every 2-3 weeks</li>
                <li>• Production time: 3-5 business days</li>
                <li>• Shipping time: 7-14 business days</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Shipping Providers</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• JNE (Jalur Nugraha Ekakurir)</li>
                <li>• POS Indonesia</li>
                <li>• Tiki (Titipan Kilat)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Coverage Area</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• All provinces in Indonesia</li>
                <li>• Remote areas may take longer</li>
                <li>• Tracking provided for all shipments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waiting List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageIcon className="h-5 w-5" />
            Card Queue ({stats.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCwIcon className="h-6 w-6 animate-spin mr-2" />
              <span>Loading waiting list...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchWaitingList} variant="outline">
                Try Again
              </Button>
            </div>
          ) : waitingList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PackageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cards in the waiting list yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitingList.map((item, index) => (
                <div key={item.payment_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.user_name}</h4>
                        <p className="text-sm text-muted-foreground">{item.institution}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(item.shipping_status)}>
                      {getStatusIcon(item.shipping_status)}
                      <span className="ml-1 capitalize">{item.shipping_status}</span>
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Purchased: {formatDate(item.payment_completed_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.shipping_region || 'Indonesia'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.estimated_shipping}</span>
                    </div>
                  </div>
                  
                  {item.batch_name && (
                    <div className="mt-2 pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Batch: {item.batch_name}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Academic Cards are physical cards shipped to verified addresses within Indonesia.</p>
        <p>For shipping inquiries, please contact our support team.</p>
      </div>
    </div>
  );
}