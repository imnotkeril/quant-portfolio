/**
 * TimelineView Component
 * Interactive timeline visualization for historical events
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../common/Card/Card';
import { Button } from '../../common/Button/Button';
import { Input } from '../../common/Input/Input';
import { Badge } from '../../common/Badge/Badge';
import { HistoricalEvent } from '../../../types/historical';
import { formatDate } from '../../../utils/formatters';
import styles from './TimelineView.module.css';

interface TimelineEvent extends HistoricalEvent {
  x: number;
  y: number;
  selected?: boolean;
}

interface TimelineViewProps {
  events: HistoricalEvent[];
  startYear?: number;
  endYear?: number;
  selectedEventIds?: string[];
  onEventSelect?: (event: HistoricalEvent) => void;
  onEventHover?: (event: HistoricalEvent | null) => void;
  onTimeRangeChange?: (startYear: number, endYear: number) => void;
  loading?: boolean;
  className?: string;
  'data-testid'?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  startYear = 1900,
  endYear = new Date().getFullYear(),
  selectedEventIds = [],
  onEventSelect,
  onEventHover,
  onTimeRangeChange,
  loading = false,
  className,
  'data-testid': testId,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<TimelineEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState<string[]>([]);

  // Filter events based on search and tags
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm ||
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags = filterTags.length === 0 ||
      filterTags.some(tag => event.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  // Convert events to timeline coordinates
  const timelineEvents: TimelineEvent[] = filteredEvents.map(event => {
    const startDate = new Date(event.startDate);
    const eventYear = startDate.getFullYear();

    // Calculate x position based on year
    const yearRange = endYear - startYear;
    const x = ((eventYear - startYear) / yearRange) * (dimensions.width - 100) + 50;

    // Calculate y position based on event type or impact
    const severityMap: Record<string, number> = {
      'high': 100,
      'medium': 200,
      'low': 300,
    };

    const severity = event.tags.find(tag => ['high', 'medium', 'low'].includes(tag)) || 'medium';
    const y = severityMap[severity] || 200;

    return {
      ...event,
      x,
      y,
      selected: selectedEventIds.includes(event.id),
    };
  });

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const deltaZoom = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev * deltaZoom)));
  };

  const handleEventClick = (event: TimelineEvent) => {
    onEventSelect?.(event);
  };

  const handleEventHover = (event: TimelineEvent | null) => {
    setHoveredEvent(event);
    onEventHover?.(event);
  };

  // Reset view
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Get all unique tags for filtering
  const allTags = Array.from(new Set(events.flatMap(event => event.tags)));

  // Handle tag filter toggle
  const handleTagToggle = (tag: string) => {
    setFilterTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Update dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Card className={`${styles.container} ${className || ''}`} loading>
        Loading timeline...
      </Card>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`} data-testid={testId}>
      <Card
        title="Historical Timeline"
        extra={
          <div className={styles.controls}>
            <Button
              variant="outline"
              size="small"
              onClick={handleResetView}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
              }
            >
              Reset View
            </Button>
          </div>
        }
      >
        <div className={styles.content}>
          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchFilter}>
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                }
              />
            </div>
            <div className={styles.tagFilters}>
              <span className={styles.filterLabel}>Filter by tags:</span>
              <div className={styles.tagList}>
                {allTags.map(tag => (
                  <div
                    key={tag}
                    className={`${styles.tagFilter} ${filterTags.includes(tag) ? styles.selected : ''}`}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline SVG */}
          <div className={styles.timelineContainer}>
            <svg
              ref={svgRef}
              className={styles.timeline}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
            >
              <defs>
                <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Timeline axis */}
                <line
                  x1={50}
                  y1={dimensions.height / 2}
                  x2={dimensions.width - 50}
                  y2={dimensions.height / 2}
                  stroke="var(--color-divider)"
                  strokeWidth="2"
                />

                {/* Year markers */}
                {Array.from({ length: Math.ceil((endYear - startYear) / 10) }, (_, i) => {
                  const year = startYear + i * 10;
                  const x = ((year - startYear) / (endYear - startYear)) * (dimensions.width - 100) + 50;

                  return (
                    <g key={year}>
                      <line
                        x1={x}
                        y1={dimensions.height / 2 - 10}
                        x2={x}
                        y2={dimensions.height / 2 + 10}
                        stroke="var(--color-divider)"
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={dimensions.height / 2 + 25}
                        textAnchor="middle"
                        fill="var(--color-neutral-gray)"
                        fontSize="12"
                      >
                        {year}
                      </text>
                    </g>
                  );
                })}

                {/* Severity level indicators */}
                <g className={styles.severityLegend}>
                  <text x={20} y={110} fill="var(--color-text-light)" fontSize="10">High Impact</text>
                  <text x={20} y={210} fill="var(--color-text-light)" fontSize="10">Medium Impact</text>
                  <text x={20} y={310} fill="var(--color-text-light)" fontSize="10">Low Impact</text>
                </g>

                {/* Events */}
                {timelineEvents.map(event => {
                  const isHovered = hoveredEvent?.id === event.id;
                  const isSelected = event.selected;

                  return (
                    <g key={event.id} className={styles.eventGroup}>
                      {/* Event line to timeline */}
                      <line
                        x1={event.x}
                        y1={dimensions.height / 2}
                        x2={event.x}
                        y2={event.y}
                        stroke="var(--color-divider)"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />

                      {/* Event circle */}
                      <circle
                        cx={event.x}
                        cy={event.y}
                        r={isSelected ? 8 : isHovered ? 6 : 4}
                        fill={isSelected ? "var(--color-accent)" : "var(--color-neutral-1)"}
                        stroke={isSelected ? "var(--color-text-light)" : "var(--color-divider)"}
                        strokeWidth={isSelected ? 2 : 1}
                        filter={isHovered ? "url(#glow)" : undefined}
                        className={styles.eventCircle}
                        onClick={() => handleEventClick(event)}
                        onMouseEnter={() => handleEventHover(event)}
                        onMouseLeave={() => handleEventHover(null)}
                      />

                      {/* Event label */}
                      <text
                        x={event.x}
                        y={event.y - 15}
                        textAnchor="middle"
                        fill="var(--color-text-light)"
                        fontSize="11"
                        fontWeight="500"
                        className={styles.eventLabel}
                        onClick={() => handleEventClick(event)}
                        onMouseEnter={() => handleEventHover(event)}
                        onMouseLeave={() => handleEventHover(null)}
                      >
                        {event.name.length > 20 ? `${event.name.substring(0, 20)}...` : event.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Tooltip */}
            {hoveredEvent && (
              <div className={styles.tooltip}>
                <div className={styles.tooltipContent}>
                  <h4 className={styles.tooltipTitle}>{hoveredEvent.name}</h4>
                  <p className={styles.tooltipDate}>
                    {formatDate(hoveredEvent.startDate)} - {formatDate(hoveredEvent.endDate)}
                  </p>
                  <p className={styles.tooltipDescription}>{hoveredEvent.description}</p>
                  <div className={styles.tooltipTags}>
                    {hoveredEvent.tags.map(tag => (
                      <Badge status="default" text={tag} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Event list */}
          <div className={styles.eventsList}>
            <h4>Events ({filteredEvents.length})</h4>
            <div className={styles.eventsGrid}>
              {timelineEvents.map(event => (
                <div
                  key={event.id}
                  className={`${styles.eventCard} ${event.selected ? styles.selected : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className={styles.eventCardHeader}>
                    <h5 className={styles.eventCardTitle}>{event.name}</h5>
                    <span className={styles.eventCardDate}>
                      {new Date(event.startDate).getFullYear()}
                    </span>
                  </div>
                  <p className={styles.eventCardDescription}>
                    {event.description.length > 100
                      ? `${event.description.substring(0, 100)}...`
                      : event.description
                    }
                  </p>
                  <div className={styles.eventCardTags}>
                    {event.tags.slice(0, 3).map(tag => (
                      <Badge status="default" text={tag} />
                    ))}
                    {event.tags.length > 3 && (
                      <span className={styles.moreTagsIndicator}>
                        +{event.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TimelineView;