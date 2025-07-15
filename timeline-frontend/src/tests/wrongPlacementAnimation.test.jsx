import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Timeline from '../components/game/Timeline';

describe('Wrong Placement Animation', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'World War II ends',
      dateOccurred: '1945-09-02',
      description: 'Japan surrenders, ending World War II',
      category: 'Military',
      difficulty: 1
    },
    {
      id: '2', 
      title: 'First moon landing',
      dateOccurred: '1969-07-20',
      description: 'Neil Armstrong becomes the first human to walk on the moon',
      category: 'Space',
      difficulty: 2
    }
  ];

  const MockGameComponent = () => {
    const [timeline, setTimeline] = useState(mockEvents);
    const [selectedCard] = useState({
      id: '3',
      title: 'Berlin Wall falls',
      dateOccurred: '1989-11-09',
      description: 'The Berlin Wall is opened, allowing free travel between East and West Berlin',
      category: 'Political',
      difficulty: 2
    });
    const timelineRef = React.useRef();

    const handleWrongPlacement = () => {
      if (timelineRef.current) {
        timelineRef.current.animateWrongPlacement(1);
      }
    };

    return (
      <div>
        <button onClick={handleWrongPlacement} data-testid="trigger-wrong-placement">
          Trigger Wrong Placement
        </button>
        <Timeline
          ref={timelineRef}
          events={timeline}
          highlightInsertionPoints={true}
          selectedCard={selectedCard}
        />
      </div>
    );
  };

  it('should show wrong placement indicator when animation is triggered', async () => {
    render(<MockGameComponent />);
    
    const triggerButton = screen.getByTestId('trigger-wrong-placement');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      const indicator = screen.getByText('❌');
      expect(indicator).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('❌')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should have proper CSS classes for wrong placement animations', () => {
    render(<Timeline events={mockEvents} />);
    
    const timelineContainer = screen.getByTestId('timeline-container');
    expect(timelineContainer).toBeInTheDocument();
    
    const timelineContent = screen.getByTestId('timeline-content');
    expect(timelineContent).toBeInTheDocument();
  });

  it('should add animation class to timeline element when wrong placement is triggered', async () => {
    render(<MockGameComponent />);
    const triggerButton = screen.getByTestId('trigger-wrong-placement');
    fireEvent.click(triggerButton);
    
    await waitFor(() => {
      const timelineContent = screen.getByTestId('timeline-content');
      const hasClass = Array.from(timelineContent.classList).some(cls => cls.includes('wrong-placement'));
      expect(hasClass).toBe(true);
    });
  });
}); 