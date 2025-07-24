export default {
  name: 'monthlyGoal',
  title: 'Monthly Goals',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Month Title',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2
    },
    {
      name: 'month',
      title: 'Month',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1).max(12)
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule: any) => Rule.required(),
      initialValue: () => new Date().getFullYear()
    },
    {
      name: 'category',
      title: 'Focus Category',
      type: 'string',
      options: {
        list: [
          { title: 'Career Growth', value: 'career' },
          { title: 'Health & Wellness', value: 'health' },
          { title: 'Learning & Skills', value: 'learning' },
          { title: 'Relationships', value: 'relationships' },
          { title: 'Creativity', value: 'creativity' },
          { title: 'Finance', value: 'finance' },
          { title: 'Adventure', value: 'adventure' },
          { title: 'Balance', value: 'balance' }
        ]
      }
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Planning', value: 'planning' },
          { title: 'Active', value: 'active' },
          { title: 'Completed', value: 'completed' },
          { title: 'Missed', value: 'missed' }
        ]
      },
      initialValue: 'planning'
    },
    {
      name: 'progress',
      title: 'Overall Progress (%)',
      type: 'number',
      validation: (Rule: any) => Rule.min(0).max(100),
      initialValue: 0
    },
    {
      name: 'goals',
      title: 'Goals for this Month',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'goal',
              title: 'Goal',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'completed',
              title: 'Completed',
              type: 'boolean',
              initialValue: false
            },
            {
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2
            }
          ]
        }
      ]
    },
    {
      name: 'achievements',
      title: 'Achievements',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'achievement',
              title: 'Achievement',
              type: 'string',
              validation: (Rule: any) => Rule.required()
            },
            {
              name: 'date',
              title: 'Date',
              type: 'date'
            },
            {
              name: 'note',
              title: 'Note',
              type: 'text',
              rows: 2
            }
          ]
        }
      ]
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
      month: 'month',
      year: 'year',
      status: 'status',
      progress: 'progress'
    },
    prepare(selection: any) {
      const { title, month, year, status, progress } = selection
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return {
        title: `${monthNames[month - 1]} ${year} - ${title}`,
        subtitle: `${status} • ${progress || 0}%`,
        media: '📅'
      }
    }
  }
}
