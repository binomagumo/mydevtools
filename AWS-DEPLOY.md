# Deploy DevToolset on AWS with a Hostinger domain

This runs the existing Next.js frontend and .NET API on one EC2 instance. Docker Compose starts both, and Caddy serves the site over HTTPS. Hostinger remains the DNS provider. Use a subdomain such as `tools.yourdomain.com` to leave your domain's other records untouched, or use the root domain if it is dedicated to DevToolset.

**Cost first:** In a new AWS Free Plan account, eligible EC2 usage consumes AWS credits. The Free Plan ends after six months or when credits run out, whichever comes first. It does **not** make an always-on site permanently free. In AWS Billing, confirm that your account shows the Free Plan and available credits before launching anything. If it does not, stop here and check your account plan. [AWS Free Tier usage](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html) · [AWS Free Tier FAQ](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-FAQ.html)

Replace every `tools.yourdomain.com` and `<PUBLIC_IP>` below with your actual hostname and IP. For a root domain such as `mydevtools.online`, use `@` instead of `tools` as the DNS record name. Run PowerShell commands on your Windows PC; run bash commands after connecting to EC2.

## 1. Put these deployment files on GitHub

This guide uses the public repository `https://github.com/binomagumo/mydevtools`. Commit and push the new `deploy/` directory, this guide, and the README change from your PC before cloning on EC2. Check `git status` first and decide which of your other local edits to include in your own commit. Do not commit `deploy/.env` or an EC2 `.pem` key.

## 2. Launch one EC2 instance

In the [EC2 console](https://console.aws.amazon.com/ec2/), pick one AWS Region and keep using it. Choose **Launch instance**:

1. Name: `devtoolset`.
2. AMI: **Amazon Linux 2023**, x86_64, marked Free Tier eligible.
3. Instance type: **t3.small**, only if your console marks it Free Tier eligible for your account. It has 2 GiB RAM; the swap step below helps with builds. [AWS eligible instance types](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-free-tier-usage.html)
4. Create a new RSA key pair in `.pem` format. Save the downloaded file outside this repository. AWS does not let you download the private key again.
5. Network: default VPC, a public subnet, **auto-assign public IPv4 enabled**. Create a security group with inbound **SSH (22) from My IP**, **HTTP (80) from Anywhere IPv4**, and **HTTPS (443) from Anywhere IPv4**. Do not open ports 3000 or 8080. Keep outbound access enabled.
6. Storage: **20 GiB gp3**. In Advanced details, set **T3 CPU credit specification to standard** if offered, so sustained CPU usage cannot add unlimited-mode CPU credit charges. Review the estimated cost before launching.

After it is running, copy its **Public IPv4 address**. Avoid stopping the instance after DNS is set: an automatically assigned public IPv4 can change on stop/start. If it changes, update the DNS A record in step 3. [AWS stop/start behavior](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Stop_Start.html)

## 3. Point Hostinger DNS to EC2

In Hostinger, open **Domains → your domain → DNS / Nameservers → DNS records**. Add or edit an **A** record:

| Type | Name | Points to |
| --- | --- | --- |
| A | `tools` for a subdomain, or `@` for the root domain | Your EC2 public IPv4 |

This makes your chosen hostname point to the instance. If your domain uses nameservers elsewhere, edit the A record at that DNS provider instead. Remove any conflicting A/AAAA record for the same hostname. DNS changes can take time to propagate. [Hostinger DNS records](https://www.hostinger.com/support/1583249-how-to-manage-dns-records-at-hostinger/) · [Hostinger A records](https://www.hostinger.com/support/4468886-how-to-manage-a-records-at-hostinger/)

On your PC, check that DNS resolves to the instance:

```powershell
Resolve-DnsName tools.yourdomain.com -Type A
```

## 4. Connect to EC2

From PowerShell on your PC, using the path where you saved the key:

```powershell
ssh -i "$HOME\Downloads\devtoolset.pem" ec2-user@<PUBLIC_IP>
```

Accept the host fingerprint after checking the address. Amazon Linux uses `ec2-user`. If SSH times out, check that the security group's SSH rule still matches your current public IP. [AWS EC2 SSH guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-to-linux-instance.html)

## 5. Install Docker and Docker Compose on EC2

Run these commands **inside the EC2 SSH session**:

```bash
sudo dnf update -y
sudo dnf install -y docker git curl
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
mkdir -p ~/.docker/cli-plugins
curl -fSL https://github.com/docker/compose/releases/download/v5.5.0/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose
```

Disconnect with `exit`, then reconnect with the SSH command from step 4 so your new Docker group membership takes effect. Check:

```bash
docker version
docker compose version
```

The Compose plugin was installed manually, so update it manually when needed. [AWS Docker setup](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/create-container-image.html) · [Docker Compose installation](https://docs.docker.com/compose/install/linux/)

## 6. Clone and configure the app on EC2

The 2 GiB instance may run out of memory while building images. Add 2 GiB swap once:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Then clone and configure:

```bash
git clone https://github.com/binomagumo/mydevtools.git
cd mydevtools/deploy
cp .env.example .env
chmod 600 .env
nano .env
```

In `nano`, replace `tools.yourdomain.com` with the exact hostname you added in Hostinger, save with **Ctrl+O**, Enter, then exit with **Ctrl+X**. Do not include `https://` in `DOMAIN`.

## 7. Build and start

From `~/mydevtools/deploy` on EC2:

```bash
docker compose config --quiet
docker compose build api
docker compose build web
docker compose up -d --no-build
docker compose ps
```

The two builds run one after the other to fit the small instance. The first build can take several minutes. Compose keeps the API and frontend private inside Docker; Caddy is the only public service. Caddy obtains and renews the HTTPS certificate after DNS points to this instance and ports 80/443 are reachable. [Caddy HTTPS requirements](https://caddyserver.com/docs/quick-starts/https)

## 8. Verify from your PC

Wait for DNS and the HTTPS certificate, then in PowerShell:

```powershell
curl.exe -fsS https://tools.yourdomain.com/healthz
curl.exe -fsS https://tools.yourdomain.com/api-proxy/api/health
```

Both should return a healthy response. Open `https://tools.yourdomain.com` and try a JSON tool. If HTTPS fails, on EC2 inspect:

```bash
cd ~/mydevtools/deploy
docker compose ps
docker compose logs --tail=100 proxy web api
```

Check the DNS A record, the EC2 public IPv4, and security group ports 80/443 before retrying.

## 9. Deploy later changes

After you push code changes to GitHub, run on EC2:

```bash
cd ~/mydevtools
git pull --ff-only
cd deploy
docker compose build api
docker compose build web
docker compose up -d --no-build
docker compose ps
```

## 10. Watch cost and clean up when finished

Check **AWS Billing and Cost Management → Free Tier / Credits** regularly. This setup uses EC2, EBS, and a public IPv4; usage can consume credits and can cost money if you later switch to a paid plan. Hostinger domain renewal is separate. To stop the deployment, terminate the EC2 instance, confirm its EBS volume was deleted, and remove the `tools` A record. `docker compose down` alone does not stop EC2 charges. [AWS Free Tier tracking](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/tracking-free-tier-usage.html)
