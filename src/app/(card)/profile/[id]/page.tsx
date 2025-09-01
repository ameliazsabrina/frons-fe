"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GraduationCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  AwardIcon,
  UserIcon,
  MapPinIcon,
  MailIcon,
  LinkIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface AcademicProfile {
  id: string;
  name: string;
  title: string;
  institution: string;
  location: string;
  email: string;
  website?: string;
  bio: string;
  specializations: string[];
  stats: {
    education: number;
    experience: number;
    publications: number;
    awards: number;
  };
  profilePhoto?: string;
}

export default function CardProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock profile data
        const mockProfile: AcademicProfile = {
          id: profileId,
          name: "Dr. Jane Smith",
          title: "Professor of Computer Science",
          institution: "Stanford University",
          location: "California, USA",
          email: "jane.smith@stanford.edu",
          website: "https://janesmith.stanford.edu",
          bio: "Dr. Jane Smith is a renowned researcher in machine learning and artificial intelligence. Her work focuses on developing novel algorithms for deep learning and their applications in computer vision and natural language processing.",
          specializations: ["Machine Learning", "Artificial Intelligence", "Computer Vision", "Deep Learning", "NLP"],
          stats: {
            education: 3,
            experience: 15,
            publications: 45,
            awards: 8,
          }
        };
        
        setProfile(mockProfile);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 py-8">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="flex-1 text-center md:text-left space-y-4">
                  <Skeleton className="h-8 w-64 mx-auto md:mx-0" />
                  <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-56 mx-auto md:mx-0" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                    <Skeleton className="w-8 h-8 mx-auto mb-2" />
                    <Skeleton className="h-6 w-8 mx-auto mb-1" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))}
              </div>
              
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 py-8">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-primary mb-4">Profile Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The academic profile you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-blue-50 py-8">
      <div className="container mx-auto px-6">
        <Card className="max-w-4xl mx-auto shadow-xl border-2 border-primary/10 bg-gradient-to-br from-white to-primary/5">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                {profile.profilePhoto ? (
                  <Image 
                    src={profile.profilePhoto} 
                    alt={profile.name}
                    width={128}
                    height={128}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-16 h-16 text-primary/60" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-spectral font-bold text-primary mb-2">
                  {profile.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-3">
                  {profile.title}
                </p>
                <div className="flex flex-col md:flex-row md:items-center gap-2 text-muted-foreground mb-4">
                  <div className="flex items-center gap-1 justify-center md:justify-start">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{profile.institution}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center md:justify-start">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="flex flex-col md:flex-row gap-3 justify-center md:justify-start">
                  <a 
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <MailIcon className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </a>
                  {profile.website && (
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-3">Specializations</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {profile.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Academic Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-white/80 rounded-lg border border-primary/10">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCapIcon className="w-6 h-6 text-primary/70" />
                </div>
                <p className="text-2xl font-bold text-primary">{profile.stats.education}</p>
                <p className="text-sm text-muted-foreground">Degrees</p>
              </div>
              <div className="text-center p-4 bg-white/80 rounded-lg border border-primary/10">
                <div className="flex items-center justify-center mb-2">
                  <BriefcaseIcon className="w-6 h-6 text-primary/70" />
                </div>
                <p className="text-2xl font-bold text-primary">{profile.stats.experience}</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </div>
              <div className="text-center p-4 bg-white/80 rounded-lg border border-primary/10">
                <div className="flex items-center justify-center mb-2">
                  <BookOpenIcon className="w-6 h-6 text-primary/70" />
                </div>
                <p className="text-2xl font-bold text-primary">{profile.stats.publications}</p>
                <p className="text-sm text-muted-foreground">Publications</p>
              </div>
              <div className="text-center p-4 bg-white/80 rounded-lg border border-primary/10">
                <div className="flex items-center justify-center mb-2">
                  <AwardIcon className="w-6 h-6 text-primary/70" />
                </div>
                <p className="text-2xl font-bold text-primary">{profile.stats.awards}</p>
                <p className="text-sm text-muted-foreground">Awards</p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-primary mb-3">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.open(`mailto:${profile.email}`, '_blank')}
                className="flex items-center gap-2"
              >
                <MailIcon className="w-4 h-4" />
                Contact
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const url = window.location.href;
                  navigator.clipboard.writeText(url);
                  // Could show a toast here
                }}
                className="flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Share Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Powered by Fronsciers */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
            <a href="https://fronsciers.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 font-semibold">
              Fronsciers
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}