export default {
  name: 'lifeGoal',
  title: 'Life Goals',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Career', value: 'career' },
          { title: 'Health & Fitness', value: 'health' },
          { title: 'Relationships', value: 'relationships' },
          { title: 'Personal Development', value: 'personal' },
          { title: 'Financial', value: 'financial' },
          { title: 'Travel & Adventure', value: 'travel' },
          { title: 'Hobbies & Interests', value: 'hobbies' },
          { title: 'Education & Learning', value: 'education' },
          { title: 'Spiritual & Mental', value: 'spiritual' },
          { title: 'Other', value: 'other' }
        ]
      },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Critical', value: 'critical' }
        ]
      },
      initialValue: 'medium'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Not Started', value: 'not_started' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'On Hold', value: 'on_hold' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' }
        ]
      },
      initialValue: 'not_started'
    },
    {
      name: 'progress',
      title: 'Progress (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
      initialValue: 0
    },
    {
      name: 'targetDate',
      title: 'Target Date',
      type: 'date'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      }
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      status: 'status',
      progress: 'progress'
    },
    prepare(selection: any) {
      const { title, subtitle, status, progress } = selection
      return {
        title,
        subtitle: `${subtitle} • ${status} • ${progress || 0}%`,
        media: '🎯'
      }
    }
  }
}
