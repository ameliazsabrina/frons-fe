"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { XIcon } from "lucide-react";
import { ResearchCategorySelector } from "@/components/ui/research-category-selector";

interface BasicInformationFormProps {
  formData: {
    title: string;
    author: string;
    category: string;
  };
  authors: string[];
  submitting: boolean;
  onInputChange: (field: string, value: string) => void;
  onRemoveItem: (field: string, itemToRemove: string) => void;
  onCategoriesChange: (categories: string[]) => void;
}

export function BasicInformationForm({
  formData,
  authors,
  submitting,
  onInputChange,
  onRemoveItem,
  onCategoriesChange,
}: BasicInformationFormProps) {
  return (
    <Card className=" shadow-sm border border-gray-100 rounded-xl bg-white/80 hover:shadow-lg transition-all duration-200">
      <CardHeader className="border-b border-gray-100/50 pb-6">
        <div className="flex items-center space-x-3">
          <div>
            <CardTitle className="text-2xl text-primary font-bold">
              Basic Information
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Provide essential details about your manuscript
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-8">
        <div className="space-y-3">
          <Label
            htmlFor="title"
            className="text-base font-semibold text-primary flex items-center"
          >
            Manuscript Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange("title", e.target.value)}
            placeholder="Enter your manuscript title"
            disabled={submitting}
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="author"
            className="text-base font-semibold text-primary"
          >
            Author(s) *
          </Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => onInputChange("author", e.target.value)}
            placeholder="Enter author names separated by commas"
            disabled={submitting}
          />
          {authors.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {authors.map((author, index) => (
                <Badge
                  key={`${author}-${index}`}
                  variant="secondary"
                  className="pl-3 pr-2 py-1 flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {author}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveItem("author", author);
                    }}
                    className="hover:text-red-600 transition-colors focus:outline-none"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold text-primary">
            Research Category *
          </Label>

          <ResearchCategorySelector
            selectedCategories={
              formData.category ? formData.category.split(", ") : []
            }
            onCategoriesChange={onCategoriesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
