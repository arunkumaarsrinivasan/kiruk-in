import { type SchemaTypeDefinition } from 'sanity'
import lifeGoal from '../lifeGoal'
import bucketListItem from '../bucketListItem'
import monthlyGoal from '../monthlyGoal'
import lifeUpdate from '../lifeUpdate'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [lifeGoal, bucketListItem, monthlyGoal, lifeUpdate],
}
