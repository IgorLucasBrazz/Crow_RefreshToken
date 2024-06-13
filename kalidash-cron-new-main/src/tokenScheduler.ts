const { prisma } = require('../lib/prismadb');
const { Prisma } = require('@prisma/client');
const cron = require('node-cron');
// @ts-ignore
const fetch = require('node-fetch');

var subDays = require('date-fns/subDays');
var addDays = require('date-fns/addDays');
const { createId } = require('@paralleldrive/cuid2');

async function refreshToken() {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        provider: 'bling',
      },
    });

    for (const account of accounts) {
      const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: account.refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        console.error(`Failed to refresh token for account ${account.id}`);
        continue;
      }

      const data = await response.json();

//       await prisma.account.update({
//         where: { id: account.id },
//         data: {
//           accessToken: data.access_token,
//           refreshToken: data.refresh_token,
//           expiresAt: new Date().getTime() + data.expires_in * 1000,
//         },
//       });

//       console.log(`Token updated for account ${account.id}`);
          console.log(data.refresh_token)
      }
   } catch (error) {
     console.error('Error refreshing tokens:', error);
   }
 }

// Agendamento para executar a cada 5 horas
cron.schedule('0 */5 * * *', refreshToken, {
  timezone: 'America/Sao_Paulo',
});
  

console.log('Token refresh scheduler started');
  
