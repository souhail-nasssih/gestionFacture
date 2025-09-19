import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, onPageChange }) {
    // Ne pas afficher la pagination s'il n'y a qu'une seule page
    if (links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, index) => {
                // Ignorer "prev" s'il n'y a pas de lien
                if (index === 0 && !link.url) return null;
                // Ignorer "next" s'il n'y a pas de lien
                if (index === links.length - 1 && !link.url) return null;

                return (
                    <button
                        key={index}
                        className={`px-3 py-1 rounded-md text-sm ${
                            link.active
                                ? 'bg-indigo-600 text-white'
                                : link.url
                                    ? 'bg-white text-gray-700 hover:bg-gray-50'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        } ${!link.url ? 'opacity-50' : ''}`}
                        onClick={() => {
                            if (link.url) {
                                onPageChange(link.label);
                            }
                        }}
                        disabled={!link.url}
                    >
                        {index === 0 ? (
                            <ChevronLeft className="h-4 w-4" />
                        ) : index === links.length - 1 ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            link.label
                        )}
                    </button>
                );
            })}
        </div>
    );
}
