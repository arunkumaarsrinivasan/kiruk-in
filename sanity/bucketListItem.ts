export default {
  name: 'bucketListItem',
  title: 'Bucket List',
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
          { title: 'Travel & Places', value: 'travel' },
          { title: 'Adventure & Sports', value: 'adventure' },
          { title: 'Skills & Learning', value: 'skills' },
          { title: 'Experiences', value: 'experiences' },
          { title: 'Creative Projects', value: 'creative' },
          { title: 'Food & Culinary', value: 'food' },
          { title: 'Social & Relationships', value: 'social' },
          { title: 'Professional', value: 'professional' },
          { title: 'Spiritual & Personal', value: 'spiritual' },
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
          { title: 'Someday', value: 'someday' },
          { title: 'This Year', value: 'this_year' },
          { title: 'Soon', value: 'soon' },
          { title: 'ASAP', value: 'asap' }
        ]
      },
      initialValue: 'someday'
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Dream', value: 'dream' },
          { title: 'Planning', value: 'planning' },
          { title: 'In Progress', value: 'in_progress' },
          { title: 'Completed', value: 'completed' },
          { title: 'Not Possible', value: 'not_possible' }
        ]
      },
      initialValue: 'dream'
    },
    {
      name: 'targetDate',
      title: 'Target Date',
      type: 'date'
    },
    {
      name: 'location',
      title: 'Location',
      type: 'string'
    },
    {
      name: 'estimatedCost',
      title: 'Estimated Cost',
      type: 'number'
    },
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'USD ($)', value: 'USD' },
          { title: 'EUR (€)', value: 'EUR' },
          { title: 'INR (₹)', value: 'INR' },
          { title: 'GBP (£)', value: 'GBP' }
        ]
      },
      initialValue: 'USD'
    },
    {
      name: 'notes',
      title: 'Notes',
      type: 'text',
      rows: 3
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true
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
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      status: 'status',
      media: 'image'
    },
    prepare(selection: any) {
      const { title, subtitle, status, media } = selection
      return {
        title,
        subtitle: `${subtitle} • ${status}`,
        media: media || '🪣'
      }
    }
  }
}
