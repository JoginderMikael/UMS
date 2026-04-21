package git.jogindermikael.University.Management.System.common.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
@Slf4j
public class RedisConfig implements CachingConfigurer {

    private final RedisConnectionFactory redisConnectionFactory;
    private final Duration cacheTtl;
    private final String cacheKeyPrefix;

    public RedisConfig(
            RedisConnectionFactory redisConnectionFactory,
            @Value("${spring.cache.redis.time-to-live:45m}") Duration cacheTtl,
            @Value("${spring.cache.redis.key-prefix:ums:}") String cacheKeyPrefix
    ) {
        this.redisConnectionFactory = redisConnectionFactory;
        this.cacheTtl = cacheTtl;
        this.cacheKeyPrefix = cacheKeyPrefix;
    }

    @Bean
    @Override
    public CacheManager cacheManager() {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(cacheTtl)
                .disableCachingNullValues()
                .computePrefixWith(cacheName -> cacheKeyPrefix + cacheName + "::")
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(redisValueSerializer()));

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(config)
                .transactionAware()
                .build();
    }

    @Bean
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn(
                        "Cache read failed for {} key {}. Falling back to the database.",
                        cache.getName(),
                        key,
                        exception
                );
                safelyEvict(cache, key);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn(
                        "Cache write failed for {} key {}. Continuing without cached state.",
                        cache.getName(),
                        key,
                        exception
                );
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn(
                        "Cache eviction failed for {} key {}. Continuing without failing the request.",
                        cache.getName(),
                        key,
                        exception
                );
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn(
                        "Cache clear failed for {}. Continuing without failing the request.",
                        cache.getName(),
                        exception
                );
            }

            private void safelyEvict(Cache cache, Object key) {
                try {
                    cache.evict(key);
                } catch (RuntimeException evictionException) {
                    log.warn(
                            "Cache eviction after a read failure also failed for {} key {}.",
                            cache.getName(),
                            key,
                            evictionException
                    );
                }
            }
        };
    }

    private GenericJackson2JsonRedisSerializer redisValueSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        objectMapper.activateDefaultTyping(
                BasicPolymorphicTypeValidator.builder()
                        .allowIfSubType("java.lang.")
                        .allowIfSubType("java.time.")
                        .allowIfSubType("java.util.")
                        .allowIfSubType("git.jogindermikael.University.Management.System.")
                        .build(),
                ObjectMapper.DefaultTyping.EVERYTHING,
                JsonTypeInfo.As.WRAPPER_ARRAY
        );

        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }
}
