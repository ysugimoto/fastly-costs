# fastly-costs

The Fastly cost calculator for each service in your account.

## Motivation

Fastly's billing provides the total costs for the customer account. However, we often would like to know how is specific service billed.
This package provides individual service costs as the following:

- `bandwidth`: response bandwidth per Gigabytes
- `requests`: received requests per 10K
- `computeRequests`: Fastly Compute received requests per 1M
- `computeDurations`: Fastly Compute cost by CPU GB-second durations

Especially, Fastly Compute pricing is difficult to calculate so this package supports to calculation easily.

## Disclaimer

This tool calculates the serice costs properly for a single service, but you may find a cost difference if you're using Origin-Shielding or Service Chaining due to a request will be passed to multiple origins or service.

## Usage

Install via npm registry. We have `bin` command so we recommend to install as global:

```shell
npm install -g fastly-costs
```

Then you can use `fastly-costs` command on your CLI:

```shell
Usage: fastly-costs [options] [filename]

Calculate Fastly billing costs per service

Arguments:
  filename                Price configuration file (default: "./prices.toml")

Options:
  -V, --version           output the version number
  -s, --start <fromDate>  Start date of billing - YYYY-MM-DD format
  -e, --end <toDate>      End date of billing - YYYY-MM-DD format
  --json                  Output cost data as JSON
  --service <filter>      Filter service for the results
  -h, --help              display help for command
```

See the following sections to run successfully.

## API Token

Note that before running this command, you need to set `FASTLY_API_TOKEN` environment variable that Fastly's API Token.
The token is enough to have `global:read` permission due to this package only calls read-related APIs.

## Pricing Configuration

Occasionally you have a specific contract with Fastly - volume discounts - so you can configure the pricing rate for each Fastly region.
To configure the pricing rate, you need to create `prices.toml` in your environment and pass to the command:

```shell
fastly-cost /path/to/prices.toml
```

The `price.toml` format must be the following:

```toml
[region]
bandwidth = (number: bandwidth price rate per unit (GB))
requests = (number: requests price rate per unit (10K))
computeRequests = (number: compute request price rate per unit (1M))
computeDurations = (number: compute duration price rate per unit (GB-Sec))
```

If you have a gradual volume discount, you should specify as:

```toml
[region]
bandwidth = [
  { threshold = 5000, price = 0.1 },
  { threshold = 10000, price = 0.08 },
  { threshold = -1, price = 0.05 },
]
```

In the above case, the bandwidth in `usa` region will be calculated as:

1. Until 5,000 units (5,000 GB = 5TB), price rate is 0.1 doller
2. Until 10,000 units (10,000 GB = 10TB), price rate is 0.08 doller
3. Over the 10,000 units, price rate is 0.05 (-1 means unlimited, over the unit)

See [prices.toml](https://github.com/ysugimoto/fastly-costs/blob/main/prices.toml) example in this repository.

You MUST specify all regions price rates that Fastly bills for:

- asia
- europe
- anzac
- asia_india
- asia_southkorea
- africa_std
- southamerica_std
- usa

That's all, you are ready to run the `fastly-costs` command :+1: the command displays:

![CleanShot 2024-02-18 at 22 00 54@2x](https://github.com/ysugimoto/fastly-costs/assets/1000401/31e20db9-043a-4ed1-a3a1-72b5ca2d2ac9)


If you want to change the calculated range, you can specify `-s` (start) and `-e` (end) options, for example:

```
fastly-costs -s 2024-01-01 -e 2024-02-01 /path/to/prices.toml
```

Also you want to get billing data as JSON (for the finops thing), provide `--json` option.

## Contribution

- Fork this repository
- Customize / Fix problem
- Send PR :-)
- Or feel free to create issues for us. We'll look into it

## Author

Yoshiaki Sugimoto <sugimoto@wnotes.net>

## License

MIT
