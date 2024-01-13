---
title: "Leaky Bucket Rate Limiting"
kind: article
created_at: 2024-01-13 19:40:00 UTC
author: Shivam Singhal
layout: post
---
Hmm…leaky bucket? The first time I heard these words, it made me chuckle. I thought what kind of name is this for a rate limiting strategy.

But upon exploring it, I found it to be a rather simple and elegant strategy used in a lot of production environments.

But what are we rate limiting? The answer, well, depends on your business requirement. A very common use case is to rate limit requests from a user of your service in a given period of time.

How do you differentiate between different users? An easy way out for us is that we can rate limit based on the IP Address of the request and that’s what we are going to do.

<aside>
I have also written out an implementation of leaky bucket algorithm at the end of this blog.
</aside>

### Formal definition:

> Leaky Bucket is a method used in network traffic and rate limiting to control the rate of incoming requests and manage potential traffic congestion. It works on a simple analogy of how water flows out of a bucket with a small hole at the bottom.
> 

<img src="/images/blog/leaky-bucket-rate-limiting/bucket.webp" class="bucket-image" style="margin: auto" alt="alt_text">

### Here's how it works:

1. **Bucket as a Buffer**: Imagine a bucket that represents a buffer for incoming requests. The size of this bucket determines the buffer capacity, which means how many requests it can hold at any given time.
2. **Constant Requests Outflow**: Requests leave the bucket (or buffer) at a constant rate, regardless of the rate at which they arrive. This constant outflow rate ensures that data is processed at a steady, manageable pace per user.
3. **Incoming Requests**: Requests arrive at the bucket at varying rates. If the incoming rate is less than or equal to the outflow rate, packets are processed smoothly.
4. **Overflow Management**: When the incoming rate exceeds the outflow rate, excess packets start filling the bucket. If the bucket fills up, new incoming packets are discarded and return a `429 - TOO MANY REQUESTS`  until there is space in the bucket again for the IP address.

### **Advantages**

The Leaky Bucket algorithm is effective in smoothing out bursty traffic - turning a variable-rate input into a constant-rate output. It's also useful in ensuring that the data processing doesn't get overwhelmed during high traffic periods.

### **Applications**

It's widely used in packet-switched networks for congestion control, in APIs for rate limiting requests, and in various other contexts where it's essential to regulate the flow of data.

## Helpful article(s)

[https://redis.com/glossary/rate-limiting](https://redis.com/glossary/rate-limiting)

I would highly recommend reading this redis article. It mentions some other rate limited strategies like fixed window, sliding window and token bucket rate limiting.

# The code

Below is a snippet. The whole code can be found at [https://github.com/shhivam/ratelimiting4**e**](https://github.com/shhivam/ratelimiting4e)

```go
type RateLimiter struct {
	RedisDB        *redis.Client
	Duration       time.Duration
	BucketCapacity int64
	ErrorHandler   func(c *gin.Context, err error)
	GetBucketName  func(c *gin.Context) string
}

func (r RateLimiter) handleIncrement(c *gin.Context, cacheKey string) error {
	value, err := r.RedisDB.Incr(c, cacheKey).Result()
	if value == 1 {
		// Key didn't exist before, so
		// we just created it, and we need to set an expiry
		r.RedisDB.Expire(c, cacheKey, r.Duration)
	}

	return err
}

func (r RateLimiter) Limit(c *gin.Context) {
	bucketName := r.GetBucketName(c)
	currentBucketSize, err := r.RedisDB.Get(c, bucketName).Result()

	if err != nil && errors.Is(err, redis.Nil) {
		err := r.handleIncrement(c, bucketName)
		if err != nil {
			r.ErrorHandler(c, err)
		}
		c.Next()
		return
	} else if err != nil {
		r.ErrorHandler(c, err)
		return
	}

	intValue, err := strconv.ParseInt(currentBucketSize, 10, 64)
	if intValue < r.BucketCapacity {
		r.handleIncrement(c, bucketName)
		c.Next()
	} else {
		fmt.Println("got too many requests")
		r.ErrorHandler(c, errors.New("too many requests"))
		return
	}
}
```

**Original Post:** [https://shivamsinghal.me/blog/leaky-bucket-rate-limiting/](https://shivamsinghal.me/blog/leaky-bucket-rate-limiting/)


<style>
  .bucket-image {
    width: 50%;
  }
  </style>
