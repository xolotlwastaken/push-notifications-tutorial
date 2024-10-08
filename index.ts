import { createClient } from 'npm:@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'
import serviceAccount from '../service-account.json' with { type: 'json' }


// this has to be the same column names as your Notifications Table
interface Notification {
  id: int
  user_id: string  // this is the uid of the person receiving the notification
  body: string  // this is the body text in the push notification
}


interface WebhookPayload {
  type: 'INSERT'
  table: string
  record: Notification
  schema: 'public'
}


const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)


Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json()


  const { data } = await supabase
    .from('profiles')  // change this to name of table where fcm_token is stored
    .select('fcm_token') // change this to the name of the column where fcm_token is stored
    .eq('id', payload.record.user_id)
    .single()


  const fcmToken = data!.fcm_token as string


  const accessToken = await getAccessToken({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
  })


  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: `Notification from Supabase`,  // change this to change the title of the push notification
            body: payload.record.body,
          },
        },
      }),
    }
  )


  const resData = await res.json()
  if (res.status < 200 || 299 < res.status) {
    throw resData
  }


  return new Response(JSON.stringify(resData), {
    headers: { 'Content-Type': 'application/json' },
  })
})


const getAccessToken = ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string
  privateKey: string
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    })
    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens!.access_token!)
    })
  })
}
