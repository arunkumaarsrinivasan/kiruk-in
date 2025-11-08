import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { ajApi, ajForm } from '@/lib/arcjet'

export async function GET(request: NextRequest) {
  // Apply Arcjet protection for API access (skip if not configured)
  if (ajApi) {
    const decision = await ajApi.protect(request, { requested: 1 });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      } else {
        return NextResponse.json(
          { error: 'Access denied.' },
          { status: 403 }
        );
      }
    }
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  try {
    let query = ''
    
    switch (type) {
      case 'life-goals':
        query = `*[_type == "lifeGoal"] | order(priority asc, createdAt desc)`
        break
      case 'bucket-list':
        query = `*[_type == "bucketListItem"] | order(priority asc, createdAt desc)`
        break
      case 'monthly-goals':
        query = `*[_type == "monthlyGoal"] | order(month desc)`
        break
      case 'life-updates':
        query = `*[_type == "lifeUpdate"] | order(date desc)`
        break
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    const data = await client.fetch(query)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Sanity API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply stricter protection for form submissions (skip if not configured)
    if (ajForm) {
      const decision = await ajForm.protect(request);
      
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            { error: 'Too many submissions. Please try again later.' },
            { status: 429 }
          );
        } else if (decision.reason.isBot()) {
          return NextResponse.json(
            { error: 'Bot traffic detected. Access denied.' },
            { status: 403 }
          );
        } else {
          return NextResponse.json(
            { error: 'Access denied.' },
            { status: 403 }
          );
        }
      }
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Type and data are required' }, { status: 400 })
    }

    const doc = {
      _type: type,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const result = await client.create(doc)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sanity Create Error:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, data } = body

    if (!id || !data) {
      return NextResponse.json({ error: 'ID and data are required' }, { status: 400 })
    }

    const result = await client.patch(id).set({
      ...data,
      updatedAt: new Date().toISOString()
    }).commit()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sanity Update Error:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const result = await client.delete(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sanity Delete Error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
