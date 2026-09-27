import type { Grade, TopicDef } from '../types'
import { G1_TOPICS } from './g1'
import { G2_TOPICS } from './g2'
import { G3_TOPICS } from './g3'
import { G4_TOPICS } from './g4'
import { G5_TOPICS } from './g5'
import { G6_TOPICS } from './g6'

export const ALL_TOPICS: TopicDef[] = [...G1_TOPICS, ...G2_TOPICS, ...G3_TOPICS, ...G4_TOPICS, ...G5_TOPICS, ...G6_TOPICS]

export function topicsOfGrade(grade: Grade): TopicDef[] {
  return ALL_TOPICS.filter((t) => t.grade === grade)
}
