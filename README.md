# fastly-costs

The Fastly cost calculator for each services in your account.

## Motivation

Fastly's billing provides total costs for the customer account. However, we ofter would like to know how is specific service billed.
This package prodices individual service cost as the following:

- `bandwidth`: response bandwith per Gigabytes
- `requests`: received requests per 10K
- `computeRequests`: Fastly Compute received requests per 1M
- `computeDurations`: Fastly Compute cost by CPU GB-second durations

Especially, Fastly Compute pricing is pretty difficult to calculate so this package support to calculate easily.

## Usage

Install via npm registry. We have `bin` command so we recommends to install as global:

```shell
npm install -g fastly-costs
```

Then you can use `fastly-costs` command on your CLI:

```shell
Usage: fastly-costs [options]

Calculate Fastly billing costs per services

Options:
-V, --version            output the version number
-c, --config <filepath>  Override use configration filepath
-s, --start <fromDate>   Start date of billing - YYYY-MM-DD format
-e, --end <toDate>       End date of billing - YYYY-MM-DD format
--json                   Output cost data as JSON
-h, --help               display help for command
```

See following sections to run completely.

## API Token

Note that before run this command, you need to set `FASTLY_API_TOKEN` environment variable that Fastly's API Token.
The token is enough to have `global:read` permission due to this package only calls read-related APIs.

## Pricing Configuration

Occasionally you have specific contract with Fastly - volume discounts - so you can configure the pricing rate for each Fastly regions.
To configure the pricing rate, you need to create `prices.toml` in your environment and pass to the command:

```shell
fastly-cost /path/to/prices.toml
```

The `price.toml` format must be the following:

```toml
[region]
bandwidth = [number: bandwith price rate per unit (GB)]
requests = [number: requests price rate per unit (10K)]
computeRequests = [number: compute request price rate per unit (1M)]
computeDurations = [number: compute duration price rate per unit (GB-Sec)]
```

If you have gradual volume discount, you should specify as:

```toml
[region]
bandwidth = [
  [5000, 0.1],
  [10000, 0.08],
  [-1, 0.05],
]
```

On the above case, request in usa region will be calculate as:

1. Until 5,000 units (5,000 GB = 5TB), price rate is 0.1 doller
2. Until 10,000 units (10,000 GB = 10TB), price rate is 0.08 doller
3. Over the 10,000 units, price rate is 0.05 (-1 means unlimited, over the unit)

You MUST specify all reagins price rate that Fastly bills for:

- asia
- europe
- anzac
- asia_india
- asia_southkorea
- africa_std
- southamerica_std
- usa

That's all, you are ready to run the `fastly-costs` command :+1: the command displays:

[image]

If you want to change the calculate range, you can specify `-s` (start) and `-e` (end) options, for example:

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
