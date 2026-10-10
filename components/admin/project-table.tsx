"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";

import { ProjectVisibilityToggle } from "@/components/admin/project-visibility-toggle";
import { StatusBadge } from "@/components/admin/status-badge";
import { TablePager } from "@/components/admin/table-pager";
import { useTableQuery } from "@/components/admin/use-table-query";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/lib/action-result";
import type { ProjectStatus } from "@/lib/admin/projects";
import { projectKindDetails, type ProjectKind } from "@/lib/project-kinds";

/** What the index needs off a project — never the description or the sources. */
export type ProjectRow = {
  slug: string;
  name: string;
  /** "Residential · Lagos". */
  meta: string;
  /**
   * "12 photographs · 2 videos" — how much is attached, which is all this screen
   * says of it. Counted on the server by `mediaCount`, since the sources
   * themselves never cross to the client.
   */
  media: string;
  isActive: boolean;
  status: ProjectStatus;
};

/** The status filter's "everything" value — a Select item cannot carry "". */
export const ALL_STATUSES = "all";

const PAGE_SIZE = 8;

/**
 * A projects index: a search box over the table, paged eight rows at a time.
 * Both Showcase sections draw this one, told apart by `kind`.
 *
 * Nothing here is sortable, unlike the catalogue indexes. The rows arrive in
 * carousel order and that order is the point of the screen — re-sorting it by
 * name would hide the one thing it is read for.
 */
export const ProjectTable = ({
  kind,
  rows,
  statuses,
  search,
  status,
  onToggle,
}: {
  /** Which section this is, which supplies the row links and the wording. */
  kind: ProjectKind;
  rows: ProjectRow[];
  statuses: readonly ProjectStatus[];
  /** The search the page queried with, as it stands in the URL. */
  search: string;
  /** Likewise the status filter, or "all". */
  status: string;
  /** The section's own visibility action, handed down to each row's switch. */
  onToggle: (slug: string, isActive: boolean) => Promise<ActionResult<string>>;
}) => {
  const { basePath, noun } = projectKindDetails[kind];
  const [page, setPage] = useState(1);

  // Search and status narrow the query the page ran; this screen adds no
  // ordering of its own, so there is nothing left to do over the rows.
  const { term, setTerm, onFilter, navigating } = useTableQuery({
    search,
    filter: status,
    filterKey: "status",
    filterAll: ALL_STATUSES,
    onNarrow: () => setPage(1),
  });

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  // A search can strand the reader past the last page; clamp on render rather
  // than resetting in an effect, which would flash the old page first.
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goTo = (next: number) => setPage(Math.min(Math.max(next, 1), pageCount));

  return (
    <div className="flex flex-col gap-4">
      {/* The console gives search its own card, above and separate from the table. */}
      <div className="border-border-default flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
        <div className="relative w-full">
          <Search
            aria-hidden
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          />
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder={`Search ${noun} name or location`}
            aria-label={`Search ${noun} name or location`}
            className="border-border-default bg-background h-10 pl-9 text-sm md:text-sm"
          />
        </div>
        <Select value={status} onValueChange={onFilter}>
          <SelectTrigger
            aria-label="Filter by visibility"
            disabled={navigating}
            className="border-border-default bg-background w-full text-sm data-[size=default]:h-10 sm:w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES}>All {noun}s</SelectItem>
            {statuses.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={`border-border-default overflow-hidden rounded-xl border transition-opacity ${
          navigating ? "opacity-60" : ""
        }`}
      >
        {visible.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyTitle>No {noun}s match</EmptyTitle>
              <EmptyDescription>
                Try a different name, or clear the search and the visibility filter.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-[820px]">
              <TableHeader className="bg-admin-muted">
                <TableRow className="border-border-default hover:bg-transparent">
                  <TableHead className="text-text-secondary h-12 px-6 text-sm font-normal">
                    Project
                  </TableHead>
                  <TableHead className="text-text-secondary h-12 pr-6 pl-0 text-sm font-normal">
                    Discipline &amp; location
                  </TableHead>
                  <TableHead className="text-text-secondary h-12 pr-6 pl-0 text-sm font-normal">
                    Media
                  </TableHead>
                  <TableHead className="text-text-secondary h-12 pr-6 pl-0 text-sm font-normal">
                    Status
                  </TableHead>
                  <TableHead className="text-text-secondary h-12 pr-6 pl-0 text-sm font-normal">
                    Show on site
                  </TableHead>
                  <TableHead className="h-12 px-6 text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row) => (
                  <TableRow key={row.slug} className="border-border-default">
                    <TableCell className="px-6 py-4">
                      <Link
                        href={`${basePath}/${row.slug}`}
                        className="text-text-primary focus-visible:ring-ring/50 rounded-sm text-sm font-medium outline-none focus-visible:ring-3"
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-text-secondary py-4 pr-6 pl-0 text-sm">
                      {row.meta || "—"}
                    </TableCell>
                    <TableCell className="text-text-primary py-4 pr-6 pl-0 text-sm">
                      {row.media}
                    </TableCell>
                    <TableCell className="py-4 pr-6 pl-0">
                      <StatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="py-4 pr-6 pl-0">
                      <ProjectVisibilityToggle
                        slug={row.slug}
                        name={row.name}
                        isActive={row.isActive}
                        onToggle={onToggle}
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-action-link h-auto p-0"
                      >
                        <Link href={`${basePath}/${row.slug}/edit`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <TablePager current={current} pageCount={pageCount} onGoTo={goTo} />
      </div>
    </div>
  );
};
