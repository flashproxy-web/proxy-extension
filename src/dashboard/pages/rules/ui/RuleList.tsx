import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { useDashboard } from '@/dashboard/shared/model';

import { deleteRule, saveRules, toggleRule } from '../model/rule-actions';

import { DefaultRuleRow } from './DefaultRuleRow';
import { RuleRow } from './RuleRow';

import type { RuleTestResult } from '../model/rule-test';

const DRAG_DISTANCE_PX = 4;

export function RuleList({ result }: { result: RuleTestResult }) {
  const { rules } = useDashboard().snapshot;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_DISTANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const winner = result && result !== 'bad' ? result.winner : null;

  const reorder = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = rules.findIndex((rule) => rule.id === active.id);
    const to = rules.findIndex((rule) => rule.id === over.id);
    void saveRules(arrayMove(rules, from, to));
  };

  return (
    <div className="overflow-x-auto rounded-b-xl">
      <div className="min-w-140">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={reorder}>
          <SortableContext
            items={rules.map((rule) => rule.id)}
            strategy={verticalListSortingStrategy}
          >
            {rules.map((rule, index) => (
              <RuleRow
                key={rule.id}
                rule={rule}
                index={index}
                winning={winner === index}
                onToggle={() => void toggleRule(rules, rule.id)}
                onDelete={() => void deleteRule(rules, rule)}
              />
            ))}
          </SortableContext>
        </DndContext>
        <DefaultRuleRow winning={winner === 'default'} />
      </div>
    </div>
  );
}
